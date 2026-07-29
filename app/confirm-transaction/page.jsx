'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Link from 'next/link';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'accept' or 'reject'
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing your transaction...');

  useEffect(() => {
    if (!token || !['accept', 'reject'].includes(action)) {
      setStatus('error');
      setMessage('Invalid confirmation link.');
      return;
    }

    const confirmTx = async () => {
      try {
        const res = await fetch('/api/transaction/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action }),
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus(action === 'accept' ? 'success' : 'rejected');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to process transaction.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    confirmTx();
  }, [token, action]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{message}</h2>
        </div>
      )}
      {status === 'success' && (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaction Confirmed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <Link href="/dashboard" className="inline-block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition">
            Go to Dashboard
          </Link>
        </div>
      )}
      {status === 'rejected' && (
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaction Rejected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <Link href="/dashboard" className="inline-block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition">
            Return to Dashboard
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <Link href="/dashboard" className="inline-block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            Go to Dashboard
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function ConfirmTransactionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
        </div>
      }>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
