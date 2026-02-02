import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

export async function checkDuplicate(textHash: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('metadata')
    .eq('metadata->>text_hash', textHash);
  return { data, error };
}
