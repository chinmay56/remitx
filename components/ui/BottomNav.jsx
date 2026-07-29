'use client';
import { Home, Send, History, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/send', icon: Send, label: 'Send' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/invest', icon: TrendingUp, label: 'Invest' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-1 p-2 min-w-[56px] relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(59,130,246,0.12)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-blue-400' : 'text-white/30'
                  }`}
                />
                <span
                  className={`text-xs relative z-10 transition-colors duration-200 font-medium ${
                    isActive ? 'text-blue-400' : 'text-white/30'
                  }`}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
