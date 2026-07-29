import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSavingsTip } from '@/lib/gemini';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.WALLET_ENCRYPTION_KEY);

    // Get last 30 days transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount_inr')
      .eq('sender_id', decoded.userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const tip = await generateSavingsTip(transactions || []);

    return NextResponse.json({ tip });
  } catch (error) {
    console.error('AI tips error:', error);
    return NextResponse.json({ 
      tip: 'Save 10% of every transfer to build your emergency fund!' 
    });
  }
}
