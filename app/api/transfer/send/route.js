import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { getExchangeRate, getCurrencyFromCountryCode } from '@/lib/forex';
import { generateToken, sendTransactionConfirmationEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);
    const { receiverRmId, receiverPhone, amountInr } = await request.json();

    if (!amountInr || amountInr <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get sender with country info
    const { data: sender } = await supabaseAdmin
      .from('users')
      .select('id, name, email, inr_balance, country_code')
      .eq('id', decoded.userId)
      .single();

    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    if (parseFloat(sender.inr_balance || 0) < amountInr) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get receiver by RM ID or phone
    let q = supabaseAdmin.from('users').select('id, name, inr_balance, country_code, country, rm_id');
    if (receiverRmId) q = q.eq('rm_id', receiverRmId);
    else if (receiverPhone) q = q.eq('phone', receiverPhone);
    else return NextResponse.json({ error: 'Provide receiverRmId or receiverPhone' }, { status: 400 });

    const { data: receiver } = await q.single();
    if (!receiver) return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    if (receiver.id === sender.id) return NextResponse.json({ error: 'Cannot send to yourself' }, { status: 400 });

    // ── Forex conversion ──
    const senderCurrency = getCurrencyFromCountryCode(sender.country_code);
    const receiverCurrency = getCurrencyFromCountryCode(receiver.country_code);
    const rate = await getExchangeRate(senderCurrency, receiverCurrency);
    const convertedAmount = +(amountInr * rate).toFixed(2);

    // Create pending transaction
    const txHash = `tx_${Date.now()}`;
    const confirmToken = generateToken();

    // Record transaction as pending
    await supabaseAdmin.from('transactions').insert([{
      sender_id: sender.id,
      receiver_id: receiver.id,
      amount_inr: amountInr,
      amount_matic: convertedAmount,   // repurposed: stores converted amount
      tx_hash: txHash,
      status: 'pending',
      fee_matic: 0,
      exchange_rate: rate,
      type: 'transfer',
      confirmation_token: confirmToken,
      confirmation_status: 'pending'
    }]);

    // Send confirmation email to sender
    await sendTransactionConfirmationEmail(sender.email, sender.name, {
      type: 'transfer',
      amount: `${senderCurrency} ${amountInr}`,
      receiver: receiver.name,
      rate: rate,
      converted: `${receiverCurrency} ${convertedAmount}`,
      txHash: txHash,
    }, confirmToken);

    return NextResponse.json({
      success: true,
      needsConfirmation: true,
      message: 'Confirmation email sent! Please check your inbox to accept or reject the transfer.',
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
  }
}
