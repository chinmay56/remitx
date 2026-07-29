'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import TransactionBadge from '@/components/ui/TransactionBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchTransactions();
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transfer/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('History error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.sender_id === user?.id;
    if (filter === 'received') return tx.receiver_id === user?.id;
    return tx.status === filter;
  });

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </div>

      {/* Search */}
      <div className="glass rounded-lg px-4 py-3 flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          className="flex-1 bg-transparent outline-none text-base"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {['all', 'sent', 'received', 'pending', 'confirmed', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              filter === f ? 'gradient-btn' : 'glass'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        {loading ? (
          <>
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
          </>
        ) : filteredTx.length === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-gray-400">No transactions found</p>
          </GlassCard>
        ) : (
          filteredTx.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl flex-shrink-0">
                    {tx.sender_id === user?.id ? '→' : '←'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold">
                          {tx.sender_id === user?.id ? tx.receiver?.name : tx.sender?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{tx.amount_inr}</p>
                        <p className="text-xs text-gray-400">{tx.exchange_rate ? `Rate: ${tx.exchange_rate}` : tx.type}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <TransactionBadge status={tx.status} />
                      {tx.tx_hash && (
                        <span className="text-xs text-gray-500 font-mono">
                          Ref: {tx.tx_hash.slice(0, 16)}…
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
