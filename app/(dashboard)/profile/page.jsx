'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, LogOut, Upload, CheckCircle,
  XCircle, AlertCircle, Copy, BadgeCheck, Phone,
  MapPin, Mail, Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.user) { setUser(data.user); localStorage.setItem('user', JSON.stringify(data.user)); }
        }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleKYCReupload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('kycFile', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/kyc/reupload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success('KYC uploaded! Awaiting review.');
        const updated = { ...user, kycStatus: 'pending', rejectionReason: null };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } else toast.error('Upload failed');
    } catch { toast.error('Something went wrong'); }
    finally { setUploading(false); }
  };

  if (!user) return null;

  const kycConfig = {
    verified: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'Verified', msg: 'Your identity is fully verified' },
    pending: { icon: AlertCircle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Pending', msg: 'Your KYC is under review' },
    rejected: { icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Rejected', msg: user.rejectionReason || 'Please re-upload your document' },
  };
  const kyc = kycConfig[user.kycStatus] || kycConfig.pending;

  const infoItems = [
    { icon: Phone, label: 'Phone Number', value: user.phone, color: '#3B82F6' },
    { icon: Mail, label: 'Email', value: user.email, color: '#8B5CF6' },
    { icon: MapPin, label: 'Country', value: user.country || 'India', color: '#10B981' },
    { icon: Wallet, label: 'Wallet', value: user.walletAddress ? `${user.walletAddress.slice(0, 16)}...` : '—', color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl glass border border-white/8 text-white/50 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-white/40 text-sm">Manage your account</p>
          </div>
        </motion.div>

        {/* Avatar card */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="show"
          className="glass rounded-3xl p-7 border border-white/8 text-center mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-xl shadow-blue-500/20">
            {user.name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-white/40 text-sm mb-4">{user.phone}</p>

          {user.rm_id && (
            <button
              onClick={() => { navigator.clipboard.writeText(user.rm_id); toast.success('RM ID copied!'); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm transition hover:opacity-80"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA' }}
            >
              <BadgeCheck className="w-4 h-4" />
              {user.rm_id}
              <Copy className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
          <p className="text-white/20 text-xs mt-2">Tap to copy your RM ID</p>
        </motion.div>

        {/* KYC Status */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="show"
          className="rounded-2xl p-5 mb-5 flex items-start gap-4"
          style={{ background: kyc.bg, border: `1px solid ${kyc.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${kyc.color}20` }}>
            <kyc.icon className="w-5 h-5" style={{ color: kyc.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <p className="font-semibold text-white text-sm">KYC {kyc.label}</p>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${kyc.color}20`, color: kyc.color, border: `1px solid ${kyc.color}30` }}>
                {user.kycStatus}
              </span>
            </div>
            <p className="text-white/40 text-xs">{kyc.msg}</p>

            {user.kycStatus === 'rejected' && (
              <div className="mt-3">
                <input type="file" accept="image/*" onChange={handleKYCReupload}
                  className="hidden" id="kyc-reupload" disabled={uploading} />
                <label htmlFor="kyc-reupload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Re-upload Document'}
                </label>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info items */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="show"
          className="glass rounded-2xl border border-white/8 overflow-hidden mb-5 divide-y divide-white/5">
          {infoItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${item.color}15` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/40 text-xs">{item.label}</p>
                <p className="text-white font-medium text-sm truncate">{item.value || '—'}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Security section */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="show"
          className="rounded-2xl p-5 mb-5 flex items-center gap-4"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Security</p>
            <p className="text-white/40 text-xs">AES-256 encrypted wallet · Bcrypt password</p>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          custom={4} variants={cardVariants} initial="hidden" animate="show"
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>

        <p className="text-center text-white/15 text-xs mt-6">RemitX v1.0.0</p>
      </div>
    </div>
  );
}
