'use client';
import { Home, Send, Download, History, TrendingUp, User, LogOut, X, Menu, PlusCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/deposit', icon: PlusCircle, label: 'Deposit' },
    { href: '/send', icon: Send, label: 'Send Money' },
    { href: '/receive', icon: Download, label: 'Receive' },
    { href: '/withdraw', icon: Wallet, label: 'Withdraw' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/invest', icon: TrendingUp, label: 'Invest' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white transition md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || true) && (
          <motion.div
            initial={false}
            className={`fixed top-0 left-0 h-full w-64 z-40 transform transition-transform duration-300 ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
            style={{
              background: 'rgba(8, 12, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="p-5 h-full flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8 mt-2">
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #E8FF6B, #B8F04A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#0A0A0A', fontWeight: 900, fontSize: 15 }}>₹</span>
                  R
                </div>
                <span className="text-lg font-bold text-white">RemitX</span>
              </div>

              {/* Nav links */}
              <nav className="space-y-1 flex-1">
                {links.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}>
                        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
                        <span className="font-medium text-sm">{label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Stats pill */}
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <p className="text-blue-400 text-xs font-semibold mb-2">Platform Stats</p>
                <div className="space-y-1">
                  {['Zero fees', '2s transfers', 'Bank security'].map(s => (
                    <p key={s} className="text-white/40 text-xs flex items-center gap-1.5">
                      <span className="text-blue-400">✓</span> {s}
                    </p>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition w-full"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
