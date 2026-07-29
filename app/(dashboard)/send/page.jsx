'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, DollarSign, CheckCircle, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';

// Client-side currency mapping (mirrors lib/forex.js)
const CC_MAP = {
  '+91':'INR','+1':'USD','+971':'AED','+65':'SGD','+44':'GBP','+49':'EUR',
  '+33':'EUR','+81':'JPY','+86':'CNY','+61':'AUD','+92':'PKR','+880':'BDT',
  '+977':'NPR','+94':'LKR','+966':'SAR','+974':'QAR',
};
const SYM = {
  INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',SGD:'S$',JPY:'¥',
  CNY:'¥',AUD:'A$',PKR:'₨',BDT:'৳',NPR:'रू',LKR:'Rs',SAR:'﷼',QAR:'QR',
};
function cc(code){ return CC_MAP[code]||'USD'; }
function sym(cur){ return SYM[cur]||cur+' '; }

export default function SendPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — receiver search
  const [rmId, setRmId] = useState('');
  const [receiver, setReceiver] = useState(null);

  // Step 2 — amount & forex
  const [amount, setAmount] = useState('');
  const [forexData, setForexData] = useState(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  // Step 3 — result
  const [result, setResult] = useState(null);

  // Sender currency (from localStorage)
  const [senderCurrency, setSenderCurrency] = useState('INR');
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.country_code) setSenderCurrency(cc(u.country_code));
    } catch {}
  }, []);

  // ── Step 1: Find receiver by RM ID ──
  const findReceiver = async () => {
    const trimmed = rmId.trim().toUpperCase();
    if (!trimmed || !trimmed.startsWith('RM')) {
      toast.error('Enter a valid RM ID (e.g. RMABCD1234)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/user/lookup?rm_id=${trimmed}`);
      const data = await res.json();
      if (res.ok && data.users?.length) {
        setReceiver(data.users[0]);
        setStep(2);
      } else {
        toast.error('User not found');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  // ── Step 2: Fetch forex rate ──
  const receiverCurrency = receiver ? cc(receiver.country_code) : 'USD';

  const fetchRate = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter valid amount'); return; }
    setFetchingRate(true);
    try {
      const res = await fetch(`/api/forex/rate?from=${senderCurrency}&to=${receiverCurrency}`);
      const data = await res.json();
      if (res.ok) {
        setForexData({
          rate: data.rate,
          convertedAmount: +(parseFloat(amount) * data.rate).toFixed(2),
        });
        setStep(3);
      } else { toast.error('Could not fetch rate'); }
    } catch { toast.error('Rate fetch failed'); }
    finally { setFetchingRate(false); }
  };

  // ── Step 3: Confirm & send ──
  const sendMoney = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transfer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverRmId: receiver.rm_id, amountInr: parseFloat(amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setStep(4);
        if (data.needsConfirmation) {
          toast.success('Confirmation email sent!');
        } else {
          toast.success('Transfer complete!');
        }
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#080C14] px-4 py-6 pb-28">
      <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="p-2 rounded-xl glass border border-white/8 text-white/50 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Send Money</h1>
          <p className="text-white/40 text-sm">Zero fees · Instant transfer</p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 w-20 rounded-full transition-all duration-300 ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
        ))}
      </div>

      {/* ── Step 1: RM ID Search ── */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard>
            <h2 className="text-xl font-bold mb-2">Who are you sending to?</h2>
            <p className="text-sm text-gray-400 mb-4">Search by RM ID</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">RM ID</label>
                <div className="flex items-center gap-2 glass rounded-lg px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text" value={rmId}
                    onChange={(e) => setRmId(e.target.value.toUpperCase())}
                    placeholder="RMABCD1234"
                    className="flex-1 bg-transparent outline-none text-base font-mono tracking-wider"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: RM followed by 8 characters</p>
              </div>
              <GradientButton onClick={findReceiver} disabled={loading} className="w-full">
                {loading ? 'Searching...' : 'Find Recipient'}
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Step 2: Amount + Forex Preview ── */}
      {step === 2 && receiver && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Receiver card */}
          <GlassCard className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {receiver.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{receiver.name}</p>
                <p className="text-sm text-gray-400">📍 {receiver.country}</p>
                <p className="text-xs text-blue-400 font-mono">{receiver.rm_id}</p>
                <p className="text-xs text-green-400 mt-0.5">Currency: {receiverCurrency}</p>
              </div>
            </div>
          </GlassCard>

          {/* Amount input */}
          <GlassCard>
            <h2 className="text-xl font-bold mb-4">How much?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount ({senderCurrency})
                </label>
                <div className="flex items-center gap-2 glass rounded-lg px-4 py-3">
                  <span className="text-gray-400 font-bold">{sym(senderCurrency)}</span>
                  <input
                    type="number" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    className="flex-1 bg-transparent outline-none text-base"
                  />
                </div>
              </div>
              <GradientButton onClick={fetchRate} disabled={fetchingRate} className="w-full">
                {fetchingRate ? (
                  <span className="flex items-center gap-2 justify-center"><RefreshCw className="w-4 h-4 animate-spin" /> Fetching rate...</span>
                ) : 'Continue'}
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Step 3: Confirm with Forex Details ── */}
      {step === 3 && forexData && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard className="mb-4">
            <h2 className="text-xl font-bold mb-4">Confirm & Send</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">To</span>
                <span className="font-semibold">{receiver?.name} ({receiver?.rm_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Region</span>
                <span className="font-semibold">📍 {receiver?.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">You Send</span>
                <span className="font-semibold">{sym(senderCurrency)}{amount} {senderCurrency}</span>
              </div>

              {/* Forex conversion highlight */}
              <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 my-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-blue-400">Exchange Rate</span>
                </div>
                <p className="text-center text-lg font-bold">
                  1 {senderCurrency} = {forexData.rate.toFixed(4)} {receiverCurrency}
                </p>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Recipient Gets</span>
                <span className="font-semibold text-green-400 text-lg">
                  {sym(receiverCurrency)}{forexData.convertedAmount} {receiverCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transfer Fee</span>
                <span className="font-semibold text-green-400">Free 🎉</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between text-lg">
                <span className="font-bold">Total Deducted</span>
                <span className="font-bold">{sym(senderCurrency)}{amount}</span>
              </div>
            </div>
            <GradientButton onClick={sendMoney} disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Confirm & Send'}
            </GradientButton>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Step 4: Success Receipt ── */}
      {step === 4 && result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-bold mb-2">
              {result.needsConfirmation ? 'Check Your Email' : 'Transfer Complete!'}
            </h2>
            <p className="text-gray-400 mb-6">
              {result.message}
            </p>

            {!result.needsConfirmation && (
              <div className="glass rounded-lg p-4 mb-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sent</span>
                  <span className="font-bold">{sym(result.senderCurrency)}{result.amountSent} {result.senderCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Received</span>
                  <span className="font-bold text-green-400">{sym(result.receiverCurrency)}{result.amountReceived} {result.receiverCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="font-mono">1 {result.senderCurrency} = {result.exchangeRate?.toFixed(4)} {result.receiverCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tx Hash</span>
                  <span className="font-mono text-xs">{result.txHash}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(1); setRmId(''); setAmount(''); setResult(null); setReceiver(null); setForexData(null); }}
                className="flex-1 glass py-3 rounded-lg font-semibold"
              >
                Send Another
              </button>
              <Link href="/dashboard" className="flex-1">
                <GradientButton className="w-full">Go Home</GradientButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      )}
      </div>
    </div>
  );
}
