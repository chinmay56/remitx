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

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, email, inr_balance, country_code')
      .eq('id', decoded.userId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (parseFloat(user.inr_balance || 0) < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const txHash = `wd_${Date.now()}`;
    const confirmToken = generateToken();

    // Record transaction as pending
    await supabaseAdmin.from('transactions').insert([{
      sender_id: user.id,
      receiver_id: user.id,
      amount_inr: parseFloat(amount),
      amount_matic: 0,
      tx_hash: txHash,
      status: 'pending',
      fee_matic: 0,
      exchange_rate: 0,
      type: 'withdraw',
      confirmation_token: confirmToken,
      confirmation_status: 'pending'
    }]);

    const userCurrency = getCurrencyFromCountryCode(user.country_code);

    // Send confirmation email
    await sendTransactionConfirmationEmail(user.email, user.name, {
      type: 'withdraw',
      amount: `${userCurrency} ${amount}`,
      txHash: txHash,
    }, confirmToken);

    return NextResponse.json({
      success: true,
      needsConfirmation: true,
      message: 'Confirmation email sent! Please check your inbox to accept or reject the withdrawal.',
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}
