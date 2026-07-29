'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminAuth', 'true');
      toast.success('Admin login successful!');
      router.push('/admin/kyc');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #EF4444, #F97316)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield style={{ color: '#fff', width: 24, height: 24 }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>Admin Portal</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>KYC Verification Dashboard</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                Username
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 16px' }}>
                <User style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="admin"
                  style={{ flex: 1, background: 'transparent', outline: 'none', color: '#fff', fontSize: 14, border: 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                Password
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 16px' }}>
                <Lock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  style={{ flex: 1, background: 'transparent', outline: 'none', color: '#fff', fontSize: 14, border: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 0 }}>
                  {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleLogin}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #EF4444, #F97316)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}
            >
              Login as Admin
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20 }}>
            🔒 Authorized access only
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
