'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Shield, Sparkles, Lock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function InvestPage() {
  const router = useRouter();

  const investments = [
    {
      title: 'Digital Gold',
      risk: 'Low',
      riskColor: '#10B981',
      returns: '8–12% p.a.',
      min: '₹100',
      icon: '🪙',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.1) 100%)',
      border: 'rgba(245,158,11,0.2)',
      accent: '#F59E0B',
      desc: 'Invest in 24K digital gold. Safe, liquid, and inflation-proof.',
    },
    {
      title: 'Mutual Funds',
      risk: 'Medium',
      riskColor: '#F59E0B',
      returns: '12–18% p.a.',
      min: '₹500',
      icon: '📈',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.1) 100%)',
      border: 'rgba(59,130,246,0.2)',
      accent: '#3B82F6',
      desc: 'Diversified equity and debt funds managed by experts.',
    },
    {
      title: 'Fixed Deposit',
      risk: 'None',
      riskColor: '#10B981',
      returns: '6–7% p.a.',
      min: '₹1,000',
      icon: '🏦',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)',
      border: 'rgba(16,185,129,0.2)',
      accent: '#10B981',
      desc: 'Guaranteed returns with zero risk. Best for stability.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 pb-28">
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
            <h1 className="text-2xl font-bold text-white">Invest & Grow</h1>
            <p className="text-white/40 text-sm">Grow your savings intelligently</p>
          </div>
        </motion.div>

        {/* AI Tip Banner */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="show"
          className="rounded-2xl p-5 mb-6 flex items-start gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-purple-300 font-semibold text-sm mb-0.5">AI Investment Tip</p>
            <p className="text-white/60 text-sm leading-relaxed">
              Based on your savings pattern, consider starting with Digital Gold — it's liquid, safe, and requires only ₹100 to begin.
            </p>
          </div>
        </motion.div>

        {/* Investment Cards */}
        <div className="space-y-4 mb-6">
          {investments.map((inv, i) => (
            <motion.div
              key={i}
              custom={i + 1} variants={cardVariants} initial="hidden" animate="show"
              whileHover={{ y: -2 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: inv.gradient, border: `1px solid ${inv.border}` }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="text-3xl">{inv.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white">{inv.title}</h3>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${inv.riskColor}20`, color: inv.riskColor, border: `1px solid ${inv.riskColor}40` }}
                    >
                      {inv.risk} Risk
                    </span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{inv.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-white/40 text-xs mb-0.5">Returns</p>
                  <p className="text-green-400 font-bold text-sm">{inv.returns}</p>
                </div>
                <div className="flex-1 rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-white/40 text-xs mb-0.5">Min. Invest</p>
                  <p className="text-white font-bold text-sm">{inv.min}</p>
                </div>
              </div>

              {/* Coming Soon overlay button */}
              <div className="relative">
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 opacity-60"
                  style={{ background: `${inv.accent}20`, border: `1px solid ${inv.accent}30`, color: inv.accent }}
                >
                  <Lock className="w-4 h-4" />
                  Coming Soon
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Financial tip */}
        <motion.div
          custom={4} variants={cardVariants} initial="hidden" animate="show"
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-blue-400 font-semibold text-sm mb-1">Financial Wisdom</p>
            <p className="text-white/40 text-xs leading-relaxed">
              Diversify your investments. Start small, reinvest returns, and increase gradually.
              Never invest money you can't afford to lose in high-risk options.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
