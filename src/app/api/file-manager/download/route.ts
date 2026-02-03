import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Get file_path from metadata
  const { data: docs, error } = await supabase
    .from('documents')
    .select('metadata')
    .eq('metadata->>document_id', id)
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!docs || docs.length === 0) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const meta = docs[0]?.metadata;
  if (!meta?.file_path) {
    return NextResponse.json(
      { error: 'file_path missing in metadata' },
      { status: 500 },
    );
  }

  // Download file from storage
  const { data: file, error: fileError } = await supabase.storage
    .from(meta.bucket || 'documents')
    .download(meta.file_path);

  if (fileError) {
    return NextResponse.json({ error: fileError.message }, { status: 500 });
  }

  // Return file as a stream
  return new Response(file, {
    headers: {
      'Content-Type': meta.file_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${meta.file_name || 'file'}"`,
    },
  });
}
