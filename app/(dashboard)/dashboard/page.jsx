'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Copy, Send, Download, Wallet, RefreshCw,
  CheckCircle, XCircle, BadgeCheck, TrendingUp,
  ArrowUpRight, ArrowDownLeft, ChevronRight, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState({ amount: '0.00', currency: '', symbol: '₹' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTx, setRecentTx] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    // Always fetch fresh data from server — never rely on localStorage for balance
    fetchAll();

    // Also refresh whenever window gets focus (coming back from deposit/send)
    const onFocus = () => fetchAll();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [router]);

  const fetchAll = async () => {
    try {
      await Promise.all([fetchUserStatus(), fetchBalance(), fetchRecentTx()]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/status', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch {}
  };

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok) {
        setBalance({ amount: data.balance, currency: data.currency, symbol: data.currencySymbol });
      }
    } catch {}
    finally { setLoading(false); }
  };

  const fetchRecentTx = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transfer/history', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setRecentTx(data.transactions.slice(0, 5));
    } catch {}
  };

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    toast.success('Address copied!');
  };

  if (!user) return null;

  const actions = [
    { href: '/send',    icon: Send,       label: 'Send',    desc: 'Transfer money',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
    { href: '/receive', icon: Download,   label: 'Receive', desc: 'Get paid via QR',  color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
    { href: '/deposit', icon: Wallet,     label: 'Deposit', desc: 'Add funds',        color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
    { href: '/invest',  icon: TrendingUp, label: 'Invest',  desc: 'Grow your money',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">
                Hey, {user.name?.split(' ')[0]} 👋
              </h1>
              {user.kycStatus === 'verified' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full badge-success text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            {user.rm_id && (
              <button
                onClick={() => { navigator.clipboard.writeText(user.rm_id); toast.success('RM ID copied!'); }}
                className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white/60 transition"
              >
                <BadgeCheck className="w-3 h-3 text-blue-400" />
                {user.rm_id}
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            className="p-2.5 rounded-xl glass border border-white/8 text-white/50 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </motion.div>

        {/* KYC rejected banner */}
        {user.kycStatus === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4"
          >
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 font-semibold text-sm">Verification Failed</p>
              <p className="text-red-400/60 text-xs">{user.rejectionReason || 'Please re-upload your document'}</p>
            </div>
            <Link href="/profile">
              <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold hover:bg-red-500/30 transition">
                Fix Now
              </button>
            </Link>
          </motion.div>
        )}

        {/* Balance Card */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="relative rounded-3xl p-7 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.2) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(ellipse at top left, rgba(59,130,246,0.15) 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-300" />
                <span className="text-blue-300 text-sm font-medium">Total Balance</span>
              </div>
              <Sparkles className="w-4 h-4 text-purple-300/50" />
            </div>
            {loading ? (
              <div className="h-12 w-40 rounded-xl shimmer mb-3" />
            ) : (
              <h2 className="text-5xl font-black text-white mb-1">
                {balance.symbol}{balance.amount}
              </h2>
            )}
            <p className="text-white/40 text-sm mb-6">{balance.currency || 'INR'} · Available Balance</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30 font-mono">{user.walletAddress?.slice(0, 16)}...</span>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition text-white/60 hover:text-white text-xs font-medium"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {actions.map((a, i) => (
            <motion.div key={i} custom={i + 1} variants={cardVariants} initial="hidden" animate="show">
              <Link href={a.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-2xl p-4 text-center cursor-pointer transition"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${a.color}22` }}>
                    <a.icon className="w-5 h-5" style={{ color: a.color }} />
                  </div>
                  <p className="text-white font-semibold text-xs">{a.label}</p>
                  <p className="text-white/30 text-xs mt-0.5 hidden sm:block">{a.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Transactions */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="show"
          className="glass rounded-3xl border border-white/8 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
            <h3 className="font-bold text-white">Recent Transactions</h3>
            <Link href="/history">
              <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentTx.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/30 text-sm">No transactions yet</p>
                <p className="text-white/20 text-xs mt-1">Send your first payment</p>
              </div>
            ) : (
              recentTx.map((tx, i) => {
                const isSender = tx.sender_id === user.id;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSender ? 'bg-red-500/10' : 'bg-green-500/10'
                    }`}>
                      {isSender
                        ? <ArrowUpRight className="w-5 h-5 text-red-400" />
                        : <ArrowDownLeft className="w-5 h-5 text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {isSender ? tx.receiver?.name : tx.sender?.name}
                      </p>
                      <p className="text-white/30 text-xs">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${isSender ? 'text-red-400' : 'text-green-400'}`}>
                        {isSender ? '-' : '+'}₹{tx.amount_inr}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.status === 'confirmed' ? 'badge-success' :
                        tx.status === 'pending' ? 'badge-pending' : 'badge-failed'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
