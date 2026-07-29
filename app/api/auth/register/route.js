import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { createWallet } from '@/lib/blockchain';
import { encryptPrivateKey } from '@/lib/encryption';
import { generateToken, sendVerificationEmail } from '@/lib/mailer';

async function generateUniqueRmId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  while (true) {
    let id = 'RM';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    const { data } = await supabaseAdmin.from('users').select('id').eq('rm_id', id).single();
    if (!data) return id;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const country = formData.get('country');
    const countryCode = formData.get('countryCode');
    const password = formData.get('password');
    const kycFile = formData.get('kycFile');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists (phone or email)
    const { data: existingPhone } = await supabaseAdmin
      .from('users').select('id').eq('phone', phone).single();
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 400 });
    }

    const { data: existingEmail } = await supabaseAdmin
      .from('users').select('id').eq('email', email).single();
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create blockchain wallet
    const wallet = createWallet();
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

    // Upload KYC document
    let kycUrl = null;
    if (kycFile && typeof kycFile === 'object' && kycFile.name) {
      const fileName = `${Date.now()}_${kycFile.name}`;
      
      // Convert file to buffer for upload
      const fileBuffer = await kycFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('kyc-documents')
        .upload(fileName, buffer, {
          contentType: kycFile.type,
          upsert: false
        });

      if (!uploadError && uploadData) {
        // Store the path, not public URL since bucket is private
        kycUrl = `kyc-documents/${fileName}`;
      } else {
        console.error('KYC upload error:', uploadError);
      }
    }

    // Generate unique RM ID + verification token
    const rmId = await generateUniqueRmId();
    const verificationToken = generateToken();

    // Create user (not verified yet)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name,
          phone,
          email,
          country,
          country_code: countryCode,
          password: hashedPassword,
          wallet_address: wallet.address,
          encrypted_private_key: encryptedPrivateKey,
          kyc_status: 'pending',
          kyc_document_url: kycUrl,
          preferred_language: 'en',
          rm_id: rmId,
          is_verified: false,
          verification_token: verificationToken,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      walletAddress: wallet.address,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
