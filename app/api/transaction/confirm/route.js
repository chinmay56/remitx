import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { token, action } = await request.json(); // action can be 'accept' or 'reject'

    if (!token || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Find pending transaction
    const { data: tx, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('confirmation_token', token)
      .eq('confirmation_status', 'pending')
      .single();

    if (error || !tx) {
      return NextResponse.json({ error: 'Transaction not found, already processed, or expired' }, { status: 404 });
    }

    if (action === 'reject') {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', confirmation_status: 'rejected', confirmation_token: null })
        .eq('id', tx.id);
      
      return NextResponse.json({ success: true, message: 'Transaction rejected successfully' });
    }

    // Processing 'accept'
    
    // For transfer, we need to deduct from sender and credit to receiver
    if (tx.type === 'transfer') {
      const { data: sender } = await supabaseAdmin.from('users').select('inr_balance').eq('id', tx.sender_id).single();
      const { data: receiver } = await supabaseAdmin.from('users').select('inr_balance').eq('id', tx.receiver_id).single();

      if (parseFloat(sender.inr_balance || 0) < tx.amount_inr) {
        await supabaseAdmin.from('transactions').update({ status: 'failed', confirmation_status: 'failed_insufficient_funds', confirmation_token: null }).eq('id', tx.id);
        return NextResponse.json({ error: 'Insufficient balance to complete transfer' }, { status: 400 });
      }

      // Deduct from sender
      await supabaseAdmin.from('users').update({ inr_balance: parseFloat(sender.inr_balance) - tx.amount_inr }).eq('id', tx.sender_id);
      // Credit receiver
      await supabaseAdmin.from('users').update({ inr_balance: parseFloat(receiver.inr_balance || 0) + tx.amount_matic }).eq('id', tx.receiver_id);
    } 
    // For deposit, we just credit the user
    else if (tx.type === 'deposit') {
      const { data: user } = await supabaseAdmin.from('users').select('inr_balance').eq('id', tx.sender_id).single();
      await supabaseAdmin.from('users').update({ inr_balance: parseFloat(user.inr_balance || 0) + tx.amount_inr }).eq('id', tx.sender_id);
    }
    // For withdraw, we deduct from user
    else if (tx.type === 'withdraw') {
      const { data: user } = await supabaseAdmin.from('users').select('inr_balance').eq('id', tx.sender_id).single();
      if (parseFloat(user.inr_balance || 0) < tx.amount_inr) {
        await supabaseAdmin.from('transactions').update({ status: 'failed', confirmation_status: 'failed_insufficient_funds', confirmation_token: null }).eq('id', tx.id);
        return NextResponse.json({ error: 'Insufficient balance to complete withdrawal' }, { status: 400 });
      }
      await supabaseAdmin.from('users').update({ inr_balance: parseFloat(user.inr_balance) - tx.amount_inr }).eq('id', tx.sender_id);
    }

    // Mark as completed
    await supabaseAdmin
      .from('transactions')
      .update({ status: 'completed', confirmation_status: 'accepted', confirmation_token: null })
      .eq('id', tx.id);

    return NextResponse.json({ success: true, message: 'Transaction confirmed successfully!' });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'Failed to process confirmation' }, { status: 500 });
  }
}
