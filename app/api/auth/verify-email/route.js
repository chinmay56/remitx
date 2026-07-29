import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find user by token
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, is_verified')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (user.is_verified) {
      return NextResponse.json({ success: true, message: 'Email already verified' });
    }

    // Update user
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_verified: true, verification_token: null })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
