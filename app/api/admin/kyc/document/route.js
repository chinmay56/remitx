import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { documentUrl } = await request.json();
    
    if (!documentUrl) {
      return NextResponse.json({ error: 'No document URL provided' }, { status: 400 });
    }

    let filePath;
    
    // Handle different URL formats
    if (documentUrl.startsWith('kyc-documents/')) {
      // Already a path
      filePath = documentUrl.replace('kyc-documents/', '');
    } else if (documentUrl.includes('/kyc-documents/')) {
      // Full URL format
      const urlParts = documentUrl.split('/kyc-documents/');
      filePath = urlParts[1];
    } else {
      // Unknown format, return as is
      return NextResponse.json({ signedUrl: documentUrl });
    }

    // Generate signed URL for private storage (valid for 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from('kyc-documents')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json({ signedUrl: documentUrl });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Document URL error:', error);
    return NextResponse.json({ error: 'Failed to get document' }, { status: 500 });
  }
}
