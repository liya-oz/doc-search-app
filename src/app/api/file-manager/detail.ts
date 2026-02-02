import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

function extractMeta(doc: any) {
  const m = doc?.metadata || {};
  if (!m.file_path) throw new Error('file_path missing in metadata');
  return {
    id: m.document_id,
    file_name: m.file_name || 'Unknown',
    file_type: m.file_type || 'unknown',
    file_size: m.file_size || 0,
    upload_date: m.upload_date || new Date().toISOString(),
    total_chunks: m.total_chunks || 0,
    file_url: m.file_url,
    file_path: m.file_path,
    metadata: m,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Get all chunks for the document
    const { data: chunks, error } = await supabase
      .from('documents')
      .select('content, metadata')
      .eq('metadata->>document_id', id)
      .order('metadata->>chunk_index', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    // Combine all chunk contents
    const fullText = chunks.map((c: any) => c.content).join('');
    const meta = extractMeta(chunks[0]);

    return NextResponse.json({ ...meta, text: fullText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
