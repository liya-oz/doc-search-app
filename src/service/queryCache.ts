import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

export async function getCachedEmbedding(query: string) {
  const { data, error } = await supabase
    .from('query_cache')
    .select('embedding')
    .eq('query_text', query)
    .single();
  return { embedding: data?.embedding, error };
}

export async function cacheEmbedding(query: string, embedding: any) {
  return await supabase
    .from('query_cache')
    .upsert({ query_text: query, embedding });
}
