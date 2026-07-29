'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';

export default function ReceivePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    toast.success('Address copied!');
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My RemitX Wallet',
          text: `Send money to my wallet: ${user?.walletAddress}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      copyAddress();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Receive Money</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="text-center">
          <h2 className="text-xl font-bold mb-6">Scan to Send</h2>
          
          <div className="bg-white p-6 rounded-2xl inline-block mb-6">
            <QRCodeSVG value={user.walletAddress} size={200} />
          </div>

          <div className="glass rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-400 mb-2">Your Wallet Address</p>
            <p className="text-sm font-mono break-all">{user.walletAddress}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyAddress}
              className="flex-1 glass py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy
            </button>
            <button
              onClick={shareAddress}
              className="flex-1 gradient-btn py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Share your QR code or wallet address with the sender
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
