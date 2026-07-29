import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { userId, reason } = await request.json();

    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        kyc_status: 'rejected',
        kyc_rejection_reason: reason 
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'KYC rejected' });
  } catch (error) {
    console.error('Reject KYC error:', error);
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
  }
}
