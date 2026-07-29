import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);
    const formData = await request.formData();
    const kycFile = formData.get('kycFile');

    if (!kycFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = `${Date.now()}_${kycFile.name}`;
    
    // Convert file to buffer for upload
    const fileBuffer = await kycFile.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('kyc-documents')
      .upload(fileName, buffer, {
        contentType: kycFile.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Store the path, not public URL since bucket is private
    const kycPath = `kyc-documents/${fileName}`;

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        kyc_document_url: kycPath,
        kyc_status: 'pending',
        kyc_rejection_reason: null,
      })
      .eq('id', decoded.userId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'KYC document uploaded successfully' });
  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
