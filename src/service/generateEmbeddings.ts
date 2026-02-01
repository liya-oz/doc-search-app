export async function generateEmbeddings(openai: any, chunks: string[]) {
  return await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
  });
}
