'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, Globe, DollarSign,
  Star, CheckCircle, Menu, X, Users, ArrowUpRight,
  Banknote, MapPin,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────
function formatINR(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

function StatCard({ icon: Icon, value, label, loading }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon size={14} style={{ color: 'rgba(232,255,107,0.7)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>{label}</span>
      </div>
      {loading ? (
        <div style={{ height: 32, width: 80, borderRadius: 6, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite' }} />
      ) : (
        <p style={{ fontSize: 28, fontWeight: 900, color: '#EFEFEF', letterSpacing: -1, lineHeight: 1 }}>{value}</p>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setStatsLoading(false); })
      .catch(() => setStatsLoading(false));
  }, []);

  const features = [
    { icon: DollarSign, title: 'Zero fees, always', desc: 'We pay all blockchain gas costs. Every rupee you send arrives in full.' },
    { icon: Zap,        title: '2-second transfers', desc: 'Polygon blockchain settles instantly. Not hours, not minutes.' },
    { icon: Shield,     title: 'AES-256 encryption', desc: 'Your private key is encrypted and stored securely. Only you can access your wallet.' },
    { icon: Globe,      title: 'Global reach', desc: 'Send to 150+ countries with live exchange rates — no hidden markups.' },
  ];

  const steps = [
    { n: '01', title: 'Create your account', sub: 'Sign up with your phone and email. Takes 30 seconds.' },
    { n: '02', title: 'Fund your wallet',     sub: 'Add money in your local currency. No minimum.' },
    { n: '03', title: 'Send to anyone',       sub: 'Enter the recipient\'s RM ID. Money arrives in seconds.' },
  ];

  const testimonials = [
    { name: 'Ravi K.',       from: 'Dubai → Kerala',     text: 'Saves me ₹800 every month in fees alone. My family gets the full amount now.', stars: 5 },
    { name: 'Priya S.',      from: 'Singapore → Mumbai', text: 'Money reaches my parents before I put my phone down. Actually instant.', stars: 5 },
    { name: 'Mohammed A.',   from: 'London → Hyderabad', text: 'Switched from Western Union. The zero-fee model changed everything for me.', stars: 5 },
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Reviews', href: '#reviews' },
  ];

  return (
    <div style={{ background: '#0A0A0A', color: '#EFEFEF', fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ───────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0 24px',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #E8FF6B, #B8F04A)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0A0A0A', fontWeight: 900, fontSize: 15 }}>₹</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>RemitX</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ gap: 32 }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href}
                style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 500 }}
                className="hover:text-white transition">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex" style={{ gap: 8, alignItems: 'center' }}>
            <button onClick={() => router.push('/login')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 14px' }}
              className="hover:text-white transition">
              Sign in
            </button>
            <button onClick={() => router.push('/register')}
              style={{ background: '#E8FF6B', color: '#0A0A0A', fontWeight: 700, fontSize: 14, padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              className="hover:opacity-90 transition">
              Get started <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 40, background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px' }}
          >
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: 15, color: 'rgba(255,255,255,0.55)', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => router.push('/login')}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Sign in
              </button>
              <button onClick={() => router.push('/register')}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#E8FF6B', color: '#0A0A0A', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Get started <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ──────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(232,255,107,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}
        >
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(232,255,107,0.08)', border: '1px solid rgba(232,255,107,0.18)', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8FF6B', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#E8FF6B', fontWeight: 600, letterSpacing: 0.3 }}>Live on Polygon · Zero gas fees</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 76px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: -3, color: '#EFEFEF', marginBottom: 24 }}>
            Send money home.<br />
            <span style={{ color: '#E8FF6B' }}>Keep every rupee.</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 40px' }}>
            Built for migrant workers. Transfer money to your family in seconds — zero fees, live exchange rates, and real security.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 72 }}>
            <button onClick={() => router.push('/register')}
              style={{ background: '#E8FF6B', color: '#0A0A0A', fontWeight: 800, fontSize: 16, padding: '15px 34px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              className="hover:opacity-90 transition">
              Start for free <ArrowRight size={17} />
            </button>
            <button onClick={() => router.push('/login')}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: 15, padding: '15px 30px', borderRadius: 12, cursor: 'pointer' }}
              className="hover:text-white hover:border-white/20 transition">
              Sign in
            </button>
          </div>

          {/* Live stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <StatCard icon={Users}    label="Users joined"       value={stats ? stats.users.toLocaleString('en-IN') : '—'}           loading={statsLoading} />
            <StatCard icon={ArrowUpRight} label="Transfers done" value={stats ? stats.transactions.toLocaleString('en-IN') : '—'}     loading={statsLoading} />
            <StatCard icon={Banknote} label="Total transferred"  value={stats ? formatINR(stats.totalInr) : '—'}                      loading={statsLoading} />
            <StatCard icon={MapPin}   label="Countries active"   value={stats ? stats.countries.toString() : '—'}                     loading={statsLoading} />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ marginBottom: 56 }}
          >
            <p style={{ fontSize: 11, color: '#E8FF6B', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>Why RemitX</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: -1.5, color: '#EFEFEF', maxWidth: 440, lineHeight: 1.15 }}>
              Everything traditional banks get wrong, we fixed.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 28px' }}
              >
                <div style={{ width: 40, height: 40, background: 'rgba(232,255,107,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <f.icon size={18} style={{ color: '#E8FF6B' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#EFEFEF', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how" style={{ padding: '96px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ marginBottom: 56 }}
          >
            <p style={{ fontSize: 11, color: '#E8FF6B', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>Process</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: -1.5, color: '#EFEFEF', lineHeight: 1.15 }}>
              Three steps.<br />That's genuinely it.
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 24 }}
              >
                <span style={{ fontSize: 12, fontWeight: 800, color: '#E8FF6B', minWidth: 26, letterSpacing: -0.3 }}>{s.n}</span>
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.07)' }} />
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#EFEFEF', marginBottom: 3 }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section id="reviews" style={{ padding: '96px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ marginBottom: 56 }}
          >
            <p style={{ fontSize: 11, color: '#E8FF6B', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>Reviews</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: -1.5, color: '#EFEFEF', lineHeight: 1.15 }}>
              Real people, real savings.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ display: 'flex', gap: 3 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={13} style={{ color: '#E8FF6B', fill: '#E8FF6B' }} />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(232,255,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8FF6B', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#EFEFEF' }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{t.from}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '56px 48px', textAlign: 'center' }}
          >
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #E8FF6B, #B8F04A)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ color: '#0A0A0A', fontWeight: 900, fontSize: 20 }}>₹</span>
            </div>

            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, letterSpacing: -1.5, color: '#EFEFEF', marginBottom: 14, lineHeight: 1.15 }}>
              Start sending today.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', marginBottom: 36, lineHeight: 1.7 }}>
              Join workers worldwide who stopped paying fees.<br />Sign up in 30 seconds.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              <button onClick={() => router.push('/register')}
                style={{ background: '#E8FF6B', color: '#0A0A0A', fontWeight: 800, fontSize: 15, padding: '14px 32px', borderRadius: 11, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                className="hover:opacity-90 transition">
                Create free account <ArrowRight size={16} />
              </button>
              <button onClick={() => router.push('/login')}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: 14, padding: '14px 28px', borderRadius: 11, cursor: 'pointer' }}
                className="hover:text-white transition">
                Sign in
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
              {['No credit card', 'Zero fees forever', 'Cancel anytime'].map((t, i) => (
                <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={11} style={{ color: 'rgba(232,255,107,0.4)' }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #E8FF6B, #B8F04A)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0A0A0A', fontWeight: 900, fontSize: 11 }}>₹</span>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>RemitX © 2026 · Built for migrant workers 🌍</span>
          </div>
          <button onClick={() => router.push('/admin/login')}
            style={{ background: 'none', border: 'none', fontSize: 12, color: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
            className="hover:text-white/40 transition">
            Admin
          </button>
        </div>
      </footer>
    </div>
  );
}
