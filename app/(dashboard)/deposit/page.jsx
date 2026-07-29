'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader2, Plus, ArrowRight, Sparkles, CreditCard, Wallet, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [user, setUser] = useState(null);

  const quickAmounts = [100, 500, 1000, 5000];
  const percent = Math.min((parseFloat(amount) / 5000) * 100, 100) || 0;

  useEffect(() => {
    fetchBalance();
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBalance(data.balance);
    } catch {}
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { toast.error('Minimum deposit is ₹1'); return; }

    setLoading(true);
    try {
      // Step 1 — load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Failed to load payment gateway. Check your connection.'); setLoading(false); return; }

      // Step 2 — create order on server
      const token = localStorage.getItem('token');
      const orderRes = await fetch('/api/deposit/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      setLoading(false);

      // Step 3 — open Razorpay modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RemitX',
        description: 'Wallet Top-up',
        order_id: orderData.orderId,
        theme: { color: '#3B82F6' },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        handler: async (response) => {
          // Step 4 — verify payment on server
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/deposit/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);
            // Update localStorage so dashboard reflects new balance immediately
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const newBal = parseFloat(stored.inr_balance || 0) + (orderData.amount / 100);
            localStorage.setItem('user', JSON.stringify({ ...stored, inr_balance: newBal }));
            setSuccess(verifyData);
            toast.success('Deposit successful!');
          } catch (e) {
            toast.error(e.message || 'Payment verification failed');
          } finally { setLoading(false); }
        },
        modal: {
          ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e) {
      toast.error(e.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
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
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
            >
              <CheckCircle style={{ width: 36, height: 36, color: '#34D399' }} />
            </motion.div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Deposit Successful!</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Your wallet has been topped up instantly.
            </p>

            {/* Receipt */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, textAlign: 'left', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Amount Added</span>
                <span style={{ color: '#34D399', fontWeight: 800, fontSize: 20 }}>{success.amountDeposited}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>New Balance</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{success.newBalance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Payment ID</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11 }}>{success.paymentId?.slice(0, 20)}...</span>
              </div>
            </div>

            {/* Verified badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              <Shield style={{ width: 14, height: 14, color: '#60A5FA' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Payment verified via Razorpay · Signature validated</span>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontWeight: 700, fontSize: 15 }}
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main deposit screen ───────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080C14] relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-28">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()}
            style={{ padding: '8px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Add Money</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Secure payment via Razorpay</p>
          </div>
        </motion.div>

        {/* Balance pill */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 4 }}>Current Balance</p>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>₹{balance}</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet style={{ width: 20, height: 20, color: '#60A5FA' }} />
          </div>
        </motion.div>

        {/* Amount input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24, marginBottom: 16 }}>

          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
            Enter Amount
          </label>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 24, fontWeight: 700 }}>₹</span>
            <input
              type="number" value={amount} min="1"
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', color: '#fff', fontSize: 48, fontWeight: 900, minWidth: 0 }}
            />
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', marginBottom: 20, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${percent}%` }} transition={{ duration: 0.3 }}
              style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {quickAmounts.map(v => (
              <button key={v} onClick={() => setAmount(String(v))}
                style={{
                  padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: amount === String(v) ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${amount === String(v) ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                  color: amount === String(v) ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>
                ₹{v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Razorpay badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, marginBottom: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CreditCard style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>Secured by Razorpay</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>UPI · Cards · Net Banking · Wallets accepted</p>
          </div>
          <Sparkles style={{ width: 14, height: 14, color: 'rgba(16,185,129,0.6)', marginLeft: 'auto', flexShrink: 0 }} />
        </motion.div>

        {/* Pay button */}
        <button
          onClick={handleDeposit}
          disabled={loading || !amount || parseFloat(amount) < 1}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
            background: (!amount || parseFloat(amount) < 1) ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            color: '#fff', fontWeight: 700, fontSize: 16, cursor: (!amount || parseFloat(amount) < 1 || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(59,130,246,0.2)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
            : <><CreditCard style={{ width: 18, height: 18 }} /> Pay {amount ? `₹${amount}` : ''} via Razorpay <ArrowRight style={{ width: 16, height: 16 }} /></>
          }
        </button>
      </div>
    </div>
  );
}
