export async function uploadFileToStorage(
  supabaseStorage: any,
  filePath: string,
  fileBuffer: Buffer,
  fileType: string,
) {
  return await supabaseStorage.storage
    .from('uploads')
    .upload(filePath, fileBuffer, {
      contentType: fileType || 'application/octet-stream',
      upsert: false,
    });
}
