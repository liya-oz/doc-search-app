import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(url, anonKey);

export async function checkDuplicate(textHash: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('metadata')
    .eq('metadata->>text_hash', textHash);
  return { data, error };
}
