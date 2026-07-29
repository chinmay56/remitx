import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken, sendTransactionConfirmationEmail } from '@/lib/mailer';
import { getCurrencyFromCountryCode } from '@/lib/forex';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);
    const { amount } = await request.json();

    if (!amount || amount < 1) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    // Get user details
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, email, country_code')
      .eq('id', decoded.userId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const paymentId = `dep_${Date.now()}`;
    const confirmToken = generateToken();

    // Record transaction as pending
    await supabaseAdmin.from('transactions').insert([{
      sender_id: decoded.userId,
      receiver_id: decoded.userId,
      amount_inr: parseFloat(amount),
      amount_matic: 0,
      tx_hash: paymentId,
      status: 'pending',
      fee_matic: 0,
      exchange_rate: 0,
      type: 'deposit',
      confirmation_token: confirmToken,
      confirmation_status: 'pending'
    }]);

    const userCurrency = getCurrencyFromCountryCode(user.country_code);

    // Send confirmation email
    await sendTransactionConfirmationEmail(user.email, user.name, {
      type: 'deposit',
      amount: `${userCurrency} ${amount}`,
      txHash: paymentId,
    }, confirmToken);

    return NextResponse.json({
      success: true,
      needsConfirmation: true,
      message: 'Confirmation email sent! Please check your inbox to accept or reject the deposit.',
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
