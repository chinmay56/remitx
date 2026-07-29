'use client';
import { motion } from 'framer-motion';

export default function GradientButton({ children, onClick, disabled, className = '' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden text-white font-bold py-4 px-6 rounded-2xl disabled:opacity-40 transition ${className}`}
      style={{
        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        boxShadow: '0 8px 24px rgba(59,130,246,0.2)',
      }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
