import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { isRateLimited } from '@/utils/limiter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const openai = new OpenAI();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { query } = await req.json();

    // Generate embedding for the user's query
    // This converts the search query into the same vector space as document chunks
    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // Find similar documents using vector similarity search
    // Dynamically set match_count based on query length
    const match_count = query.length < 40 ? 3 : 5;
    const { data: results, error } = await supabase.rpc('match_documents', {
      query_embedding: JSON.stringify(emb.data[0].embedding),
      match_threshold: 0.0,
      match_count,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Combine retrieved chunks into context, limiting total size
    const MAX_CHARS = 3000;
    let context = '';
    for (const r of results ?? []) {
      if (context.length + r.content.length > MAX_CHARS) break;
      context += r.content + '\n---\n';
    }

    // If no context, short-circuit and avoid OpenAI call
    if (!context) {
      return NextResponse.json({
        answer:
          'I do not know. The information is not available in the uploaded documents.',
        sources: [],
      });
    }

    // Generate answer using OpenAI with retrieved context
    // This is the "Generation" part of RAG
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Answer only using the provided context. If the answer is not present, say you do not know. Be concise.',
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${query}`,
        },
      ],
      max_tokens: 200,
    });

    return NextResponse.json({
      answer: completion.choices[0].message.content,
      sources: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
