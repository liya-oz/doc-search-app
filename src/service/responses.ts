import { NextResponse } from 'next/server';

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function duplicateResponse(metadata: any, fileUrl: string) {
  return NextResponse.json({
    success: true,
    duplicate: true,
    metadata,
    fileUrl,
  });
}

export function successResponse(
  documentId: string,
  fileName: string,
  chunks: number,
  textLength: number,
  fileUrl: string,
) {
  return NextResponse.json({
    success: true,
    documentId,
    fileName,
    chunks,
    textLength,
    fileUrl,
  });
}
