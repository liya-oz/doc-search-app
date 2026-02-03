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

export async function GET() {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('metadata');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Deduplicate documents by document_id
    const map = new Map();
    documents?.forEach((doc: any) => {
      let meta;
      try {
        meta = extractMeta(doc);
      } catch {
        return; // skip if file_path missing
      }
      if (meta.id && !map.has(meta.id)) {
        map.set(meta.id, meta);
      }
    });

    return NextResponse.json({ documents: Array.from(map.values()) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
