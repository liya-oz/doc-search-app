import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { processUpload } from '@/service/processUpload';
import { errorResponse } from '@/service/responses';
import crypto from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseStorage = createClient(url, serviceKey);
const supabase = createClient(url, serviceKey);
const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const file = (await req.formData()).get('file') as File;
    if (!file) return errorResponse('No file provided', 400);

    const documentId = crypto.randomUUID();
    const uploadDate = new Date().toISOString();

    return await processUpload(
      file,
      documentId,
      uploadDate,
      supabaseStorage,
      supabase,
      openai,
    );
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to process file');
  }
}
