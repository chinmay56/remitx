import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        kyc_status: 'verified',
        kyc_rejection_reason: null 
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'KYC approved' });
  } catch (error) {
    console.error('Approve KYC error:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
