import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { phone, password } = await request.json();

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ── Check email verification ──
    if (!user.is_verified) {
      return NextResponse.json({
        error: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email,
      }, { status: 403 });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.WALLET_ENCRYPTION_KEY, {
      expiresIn: '30d',
    });

    // Save session to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await supabaseAdmin
      .from('sessions')
      .insert([{
        user_id: user.id,
        token,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        expires_at: expiresAt.toISOString(),
      }]);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        country_code: user.country_code,
        walletAddress: user.wallet_address,
        kycStatus: user.kyc_status,
        rejectionReason: user.kyc_rejection_reason,
        rm_id: user.rm_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
