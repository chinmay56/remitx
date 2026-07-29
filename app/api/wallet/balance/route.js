import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrencyFromCountryCode, getCurrencySymbol } from '@/lib/forex';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('inr_balance, wallet_address, country_code')
      .eq('id', decoded.userId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const currency = getCurrencyFromCountryCode(user.country_code);
    const symbol = getCurrencySymbol(currency);

    return NextResponse.json({
      balance: parseFloat(user.inr_balance || 0).toFixed(2),
      currency,
      currencySymbol: symbol,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
