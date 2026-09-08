import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionTextProps {
  notification: {
    id: number;
    text: string;
    type?: 'primary' | 'gold' | 'danger' | 'special';
  } | null;
}

export const ActionText: React.FC<ActionTextProps> = ({ notification }) => {
  if (!notification || !notification.text) return null;

  const type = notification.type || 'gold';

  const styleConfig = {
    primary: {
      color: '#34d399',
      border: '2px solid rgba(52, 211, 153, 0.8)',
      glow: '0 0 25px rgba(16, 185, 129, 0.6), 0 10px 30px rgba(0, 0, 0, 0.9)',
      background: 'rgba(5, 26, 19, 0.92)',
    },
    gold: {
      color: '#fbbf24',
      border: '2px solid rgba(251, 191, 36, 0.9)',
      glow: '0 0 30px rgba(245, 158, 11, 0.7), 0 10px 35px rgba(0, 0, 0, 0.95)',
      background: 'rgba(18, 14, 4, 0.94)',
    },
    danger: {
      color: '#f87171',
      border: '2px solid rgba(248, 113, 113, 0.9)',
      glow: '0 0 30px rgba(239, 68, 68, 0.7), 0 10px 35px rgba(0, 0, 0, 0.95)',
      background: 'rgba(28, 6, 6, 0.94)',
    },
    special: {
      color: '#c084fc',
      border: '2px solid rgba(192, 132, 252, 0.9)',
      glow: '0 0 30px rgba(168, 85, 247, 0.7), 0 10px 35px rgba(0, 0, 0, 0.95)',
      background: 'rgba(20, 7, 30, 0.94)',
    },
  };

  const config = styleConfig[type] || styleConfig.gold;

  return (
    <div
      style={{
        position: 'absolute',
        top: '38%',
        left: '50%',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={notification.id}
          initial={{ x: '-50%', y: '-30%', scale: 0.7, opacity: 0 }}
          animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
          exit={{ x: '-50%', y: '-70%', scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px clamp(18px, 4vw, 32px)',
            borderRadius: 9999,
            background: config.background,
            border: config.border,
            boxShadow: config.glow,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(20px, 4.2vw, 38px)',
              fontWeight: 900,
              color: config.color,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.9)',
            }}
          >
            {notification.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
