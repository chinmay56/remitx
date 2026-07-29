'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Banknote, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [balance, setBalance] = useState('0.00');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBalance(data.balance);
    } catch {}
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { toast.error('Minimum withdrawal is ₹1'); return; }
    if (amt > parseFloat(balance)) { toast.error('Insufficient balance'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data);
      toast.success('Withdrawal initiated!');
    } catch (e) {
      toast.error(e.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];
  const percent = Math.min((parseFloat(amount) / parseFloat(balance)) * 100, 100) || 0;

  if (success) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="orb orb-1" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md z-10"
        >
          <div className="glass-strong rounded-3xl p-10 border border-white/10 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {success.needsConfirmation ? 'Check Your Email' : 'Withdrawal Successful!'}
            </h2>
            <p className="text-white/50 text-sm mb-8">
              {success.needsConfirmation ? success.message : 'Your bank account will be credited shortly.'}
            </p>

            {!success.needsConfirmation && (
              <div className="rounded-2xl p-5 mb-6 text-left space-y-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Amount Withdrawn</span>
                  <span className="text-green-400 font-bold text-xl">{success.amountWithdrawn}</span>
                </div>
                {success.txHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">Reference</span>
                    <span className="text-white/60 font-mono text-xs">{success.txHash?.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className="btn-gradient w-full py-4 rounded-2xl text-white font-bold"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl glass border border-white/8 text-white/50 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Withdraw Money</h1>
            <p className="text-white/40 text-sm">Transfer to your bank account</p>
          </div>
        </motion.div>

        {/* Balance pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <div>
            <p className="text-white/40 text-xs mb-1">Available Balance</p>
            <p className="text-white font-bold text-2xl">₹{balance}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-blue-400" />
          </div>
        </motion.div>

        {/* Amount input card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-3xl p-6 border border-white/8 mb-4"
        >
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-white/30 text-2xl font-bold">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              max={balance}
              className="flex-1 bg-transparent outline-none text-white text-5xl font-black placeholder-white/10"
            />
            <button
              onClick={() => setAmount(balance)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition"
            >
              MAX
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/5 mb-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                  amount === String(v)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/8'
                }`}
              >
                ₹{v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Fee notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <span className="text-green-400 text-sm">✓</span>
          <p className="text-green-400 text-xs font-medium">Zero withdrawal fees · Instant processing</p>
        </motion.div>

        {/* Withdraw button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleWithdraw}
          disabled={loading || !amount || parseFloat(amount) > parseFloat(balance) || parseFloat(amount) < 1}
          className="btn-gradient w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Banknote className="w-5 h-5" />
              Withdraw {amount ? `₹${amount}` : ''}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
