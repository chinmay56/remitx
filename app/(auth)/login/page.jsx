'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const phoneRef = useRef('');
  const passwordRef = useRef('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  // Use refs for input values to avoid re-renders on every keystroke
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [passwordDisplay, setPasswordDisplay] = useState('');

  const handleLogin = async () => {
    const phone = phoneRef.current;
    const password = passwordRef.current;
    if (!phone || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        if (data.needsVerification) { setUnverifiedEmail(data.email); toast.error(data.error); }
        else toast.error(data.error || 'Login failed');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      if (res.ok) toast.success('Verification email sent!');
      else toast.error(data.error || 'Failed to resend');
    } catch { toast.error('Something went wrong'); }
    finally { setResending(false); }
  };

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    outline: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 14,
    minWidth: 0,
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '13px 16px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>

      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #E8FF6B, #B8F04A)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(232,255,107,0.15)' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 900, fontSize: 20 }}>₹</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Sign in to your RemitX account</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
              Phone Number
            </label>
            <div style={wrapperStyle}>
              <Phone style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              <input
                type="tel"
                defaultValue=""
                onChange={e => { phoneRef.current = e.target.value; setPhoneDisplay(e.target.value); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
              Password
            </label>
            <div style={wrapperStyle}>
              <Lock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                defaultValue=""
                onChange={e => { passwordRef.current = e.target.value; setPasswordDisplay(e.target.value); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your password"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 0, flexShrink: 0 }}
              >
                {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <><span>Sign In</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
          </button>

          {/* Unverified notice */}
          {unverifiedEmail && (
            <div style={{ marginTop: 16, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 16 }}>
              <p style={{ color: '#FCD34D', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>
                Please verify your email first
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 10 }}>
            New here?{' '}
            <Link href="/register" style={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
          <Link href="/admin/login" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, textDecoration: 'none' }}>
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
