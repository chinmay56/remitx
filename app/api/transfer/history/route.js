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

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        sender:sender_id(name, country),
        receiver:receiver_id(name, country)
      `)
      .or(`sender_id.eq.${decoded.userId},receiver_id.eq.${decoded.userId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ transactions: transactions || [] });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
