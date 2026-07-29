'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Lock, Upload, CheckCircle, Loader2, Eye, EyeOff, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { countries, detectUserLocation } from '@/lib/location';

// ── Defined OUTSIDE the component so it never gets recreated ──
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.3 } }),
};

const wrapStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16, padding: '13px 16px',
};

const inputStyle = {
  flex: 1, background: 'transparent', outline: 'none',
  border: 'none', color: '#fff', fontSize: 14, minWidth: 0,
};

// ── Component ──────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]               = useState(1);
  const [direction, setDirection]     = useState(1);
  const [loading, setLoading]         = useState(false);
  const [detecting, setDetecting]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [kycFile, setKycFile]         = useState(null);

  // Country / code / currency use state because they come from select/detect
  const [country, setCountry]         = useState('India');
  const [countryCode, setCountryCode] = useState('+91');
  const [currency, setCurrency]       = useState('INR');

  // Text inputs use refs — no re-render on every keystroke
  const nameRef     = useRef('');
  const emailRef    = useRef('');
  const phoneRef    = useRef('');
  const passwordRef = useRef('');

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const loc = await detectUserLocation();
      const c = countries.find(c => c.code === loc.code) || countries[0];
      setCountry(c.name); setCountryCode(c.dialCode); setCurrency(c.currency);
      toast.success(`Detected: ${c.name}`);
    } catch { toast.error('Could not detect location'); }
    finally { setDetecting(false); }
  };

  const handleCountryChange = (name) => {
    const c = countries.find(c => c.name === name);
    if (c) { setCountry(c.name); setCountryCode(c.dialCode); setCurrency(c.currency); }
  };

  const goNext = () => {
    const name = nameRef.current; const email = emailRef.current;
    const phone = phoneRef.current; const password = passwordRef.current;
    if (!name || !email || !phone || !password) { toast.error('Please fill all fields'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email'); return; }
    setDirection(1); setStep(2);
  };

  const handleRegister = async () => {
    setDirection(1); setStep(3); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', nameRef.current);
      fd.append('email', emailRef.current);
      fd.append('phone', phoneRef.current);
      fd.append('password', passwordRef.current);
      fd.append('country', country);
      fd.append('countryCode', countryCode);
      fd.append('currency', currency);
      if (kycFile) fd.append('kycFile', kycFile);

      const res = await fetch('/api/auth/register', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setWalletAddress(data.walletAddress);
        toast.success('Account created! Check your email.');
        setTimeout(() => router.push('/login'), 4000);
      } else {
        toast.error(data.error || 'Registration failed');
        setDirection(-1); setStep(1);
      }
    } catch {
      toast.error('Something went wrong');
      setDirection(-1); setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #E8FF6B, #B8F04A)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(232,255,107,0.15)' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 900, fontSize: 20 }}>₹</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 0, letterSpacing: -0.5 }}>Create Account</h1>

          {step < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: s < step ? '#10B981' : s === step ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                    color: s <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}>
                    {s < step ? '✓' : s}
                  </div>
                  {s < 2 && <div style={{ width: 40, height: 1, background: s < step ? '#10B981' : 'rgba(255,255,255,0.08)' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" custom={direction}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28 }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>Personal Information</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Full Name</label>
                    <div style={wrapStyle}>
                      <User style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                      <input type="text" defaultValue="" onChange={e => nameRef.current = e.target.value}
                        placeholder="Your full name" style={inputStyle} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Email Address</label>
                    <div style={wrapStyle}>
                      <Mail style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                      <input type="email" defaultValue="" onChange={e => emailRef.current = e.target.value}
                        placeholder="you@email.com" style={inputStyle} />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Country</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ ...wrapStyle, flex: 1 }}>
                        <MapPin style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                        <select value={country} onChange={e => handleCountryChange(e.target.value)}
                          style={{ ...inputStyle, cursor: 'pointer' }}>
                          {countries.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                        </select>
                      </div>
                      <button onClick={detectLocation} disabled={detecting}
                        style={{ padding: '0 14px', borderRadius: 14, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA', cursor: 'pointer', fontSize: 16 }}>
                        {detecting ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : '📍'}
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5, marginLeft: 2 }}>Currency: {currency}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Phone Number</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                        style={{ ...wrapStyle, width: 90, cursor: 'pointer', fontSize: 13 }}>
                        {countries.map(c => <option key={c.code} value={c.dialCode}>{c.flag} {c.dialCode}</option>)}
                      </select>
                      <div style={{ ...wrapStyle, flex: 1 }}>
                        <Phone style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                        <input type="tel" defaultValue="" onChange={e => phoneRef.current = e.target.value}
                          placeholder="98765 43210" style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Password</label>
                    <div style={wrapStyle}>
                      <Lock style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                      <input type={showPassword ? 'text' : 'password'} defaultValue=""
                        onChange={e => passwordRef.current = e.target.value}
                        placeholder="Create a strong password" style={inputStyle} />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 0, flexShrink: 0 }}>
                        {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                      </button>
                    </div>
                  </div>

                  <button onClick={goNext}
                    style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                    Continue <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28 }}>
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Identity Verification</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Upload your Aadhar, Passport, or Driver's License</p>

                <input type="file" accept="image/*,.pdf" onChange={e => setKycFile(e.target.files[0])} className="hidden" id="kyc-upload" />
                <label htmlFor="kyc-upload" style={{
                  display: 'block', width: '100%', padding: '40px 20px', borderRadius: 16,
                  border: `2px dashed ${kycFile ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: kycFile ? 'rgba(16,185,129,0.05)' : 'transparent',
                  cursor: 'pointer', textAlign: 'center', marginBottom: 16,
                }}>
                  {kycFile ? (
                    <><CheckCircle style={{ width: 36, height: 36, color: '#34D399', margin: '0 auto 8px' }} />
                    <p style={{ color: '#34D399', fontWeight: 600, fontSize: 13 }}>{kycFile.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4 }}>Click to change</p></>
                  ) : (
                    <><Upload style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.2)', margin: '0 auto 8px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 13 }}>Click to upload document</p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4 }}>JPG, PNG or PDF</p></>
                  )}
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 20 }}>
                  <span style={{ fontSize: 12 }}>🔒</span>
                  <p style={{ color: '#60A5FA', fontSize: 12 }}>Your ID is encrypted with AES-256 and stored securely</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setDirection(-1); setStep(1); }}
                    style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <ArrowLeft style={{ width: 15, height: 15 }} /> Back
                  </button>
                  <button onClick={handleRegister}
                    style={{ flex: 2, padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Create Account <ArrowRight style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, textAlign: 'center' }}>
                {!walletAddress ? (
                  <>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Loader2 style={{ width: 32, height: 32, color: '#60A5FA', animation: 'spin 1s linear infinite' }} />
                    </div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Setting up your account</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Creating your secure blockchain wallet...</p>
                  </>
                ) : (
                  <>
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <CheckCircle style={{ width: 32, height: 32, color: '#34D399' }} />
                    </motion.div>
                    <p style={{ color: '#fff', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Account Created!</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                      We've sent a verification email.<br />Please verify before logging in.
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, textAlign: 'left', marginBottom: 16 }}>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 4 }}>Your Wallet Address</p>
                      <p style={{ color: '#60A5FA', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{walletAddress}</p>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>Redirecting to login...</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 3 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
