export async function insertChunks(
  supabase: any,
  chunks: string[],
  embeddingResponse: any,
  meta: any,
) {
  for (let i = 0; i < chunks.length; i++) {
    const embedding = embeddingResponse.data[i].embedding;
    const { error } = await supabase.from('documents').insert({
      content: chunks[i],
      metadata: { ...meta, chunk_index: i, total_chunks: chunks.length },
      embedding: JSON.stringify(embedding),
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}
