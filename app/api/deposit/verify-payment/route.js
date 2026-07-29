import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await request.json();

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Get user's current balance
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('inr_balance')
      .eq('id', decoded.userId)
      .single();

    const amountINR = parseFloat(amount) / 100; // convert paise to INR
    const newBalance = parseFloat(user.inr_balance || 0) + amountINR;

    // Credit balance
    await supabaseAdmin
      .from('users')
      .update({ inr_balance: newBalance })
      .eq('id', decoded.userId);

    // Record transaction
    await supabaseAdmin.from('transactions').insert([{
      sender_id: decoded.userId,
      receiver_id: decoded.userId,
      amount_inr: amountINR,
      amount_matic: 0,
      tx_hash: razorpay_payment_id,
      status: 'confirmed',
      type: 'deposit',
    }]);

    return NextResponse.json({
      success: true,
      amountDeposited: `₹${amountINR.toFixed(2)}`,
      newBalance: `₹${newBalance.toFixed(2)}`,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
