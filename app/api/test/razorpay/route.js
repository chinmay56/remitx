import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create a test order for ₹1
    const order = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
    });

    return NextResponse.json({
      status: '✅ Razorpay keys working',
      key_id: process.env.RAZORPAY_KEY_ID,
      test_order_id: order.id,
      amount: '₹1 (test)',
    });
  } catch (error) {
    return NextResponse.json({
      status: '❌ Razorpay error',
      error: error.message,
    }, { status: 500 });
  }
}
