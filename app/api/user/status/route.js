import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, phone, country, wallet_address, kyc_status, kyc_rejection_reason, rm_id')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        country: user.country,
        rm_id: user.rm_id,
        walletAddress: user.wallet_address,
        kycStatus: user.kyc_status,
        rejectionReason: user.kyc_rejection_reason,
      }
    });
  } catch (error) {
    console.error('User status error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
