import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Get file_path and bucket from metadata
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

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from(meta.bucket || 'documents')
    .remove([meta.file_path]);

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  // Delete all chunks from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('metadata->>document_id', id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
