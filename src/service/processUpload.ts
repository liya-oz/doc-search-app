import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { extractTextFromFile } from './extractText';
import { hashText } from './hash';
import { checkDuplicate } from './deduplicate';
import { uploadFileToStorage } from './uploadFile';
import { generateEmbeddings } from './generateEmbeddings';
import { insertChunks } from './insertChunks';
import { duplicateResponse, successResponse, errorResponse } from './responses';

export async function processUpload(
  file: File,
  documentId: string,
  uploadDate: string,
  supabaseStorage: any,
  supabase: any,
  openai: any,
) {
  const fileExt = file.name.split('.').pop() || 'bin';
  const filePath = `${documentId}.${fileExt}`;

  // Extract and validate text
  const text = await extractTextFromFile(file);
  if (!text?.trim()) {
    return errorResponse('Could not extract text from file', 400);
  }

  // Check for duplicate
  const textHash = hashText(text);
  const { data: existingDocuments = [], error: findError } =
    await checkDuplicate(textHash);
  if (findError) return errorResponse(findError.message);
  if (existingDocuments && existingDocuments.length > 0) {
    const { metadata } = existingDocuments[0];
    return duplicateResponse(metadata, metadata.file_url);
  }

  // Upload file
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const { error: storageError } = await uploadFileToStorage(
    supabaseStorage,
    filePath,
    fileBuffer,
    file.type,
  );
  if (storageError) {
    const msg = storageError.message || 'Unknown storage error';
    if (msg.includes('row-level security') || msg.includes('RLS')) {
      return errorResponse(
        `Storage RLS error: ${msg}. Ensure SUPABASE_SERVICE_ROLE_KEY is set.`,
      );
    }
    return errorResponse(`Failed to store file: ${msg}`);
  }

  // Get public URL
  const { data: urlData } = supabaseStorage.storage
    .from('uploads')
    .getPublicUrl(filePath);

  // Split text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
  });
  const chunks = await textSplitter.splitText(text);

  // Generate embeddings and store
  const embeddingResponse = await generateEmbeddings(openai, chunks);
  const meta = {
    source: file.name,
    document_id: documentId,
    file_name: file.name,
    file_type: file.type || fileExt,
    file_size: file.size,
    upload_date: uploadDate,
    file_path: filePath,
    file_url: urlData.publicUrl,
    text_hash: textHash,
  };
  await insertChunks(supabase, chunks, embeddingResponse, meta);

  return successResponse(
    documentId,
    file.name,
    chunks.length,
    text.length,
    urlData.publicUrl,
  );
}
