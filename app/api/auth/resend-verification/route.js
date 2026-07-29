import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken, sendVerificationEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, is_verified, verification_token')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Reuse existing token or generate new one
    let token = user.verification_token;
    if (!token) {
      token = generateToken();
      await supabaseAdmin
        .from('users')
        .update({ verification_token: token })
        .eq('id', user.id);
    }

    // Send email
    await sendVerificationEmail(email, user.name, token);

    return NextResponse.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 });
  }
}
