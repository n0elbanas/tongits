import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Player } from '../../game/engine/gameState';
import { Sparkles, Crown } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface VictoryModalProps {
  isOpen: boolean;
  winner?: Player;
  onDismiss: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  onDismiss,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playTongitsFanfare();

      // Launch golden confetti sequence
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: 20,
        }}
        onClick={onDismiss}
      >
        <motion.div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: 480,
            maxHeight: '92dvh',
            overflowY: 'auto',
            borderRadius: 24,
            padding: 'clamp(18px, 3.5vh, 32px) clamp(14px, 3vw, 26px)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 0 50px rgba(245, 158, 11, 0.4), 0 20px 60px rgba(0, 0, 0, 0.9)',
          }}
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Winner Avatar Glowing Ring */}
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: '2px dashed #fbbf24',
                opacity: 0.8,
              }}
            />
            <PlayerAvatar
              avatarId={winner?.avatar}
              name={winner?.name}
              size={84}
              status="WINNER"
              showStatusRing={false}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{
                position: 'absolute',
                top: -16,
                right: -6,
                background: '#fbbf24',
                color: '#1a0f02',
                borderRadius: '50%',
                padding: 4,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Crown size={18} />
            </motion.div>
          </div>

          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              overflow: 'visible',
            }}
          >
            <h1
              className="gold-gradient-text"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(34px, 7vw, 46px)',
                fontWeight: 900,
                letterSpacing: '0.06em',
                lineHeight: 1.3,
                display: 'inline-block',
                padding: '6px 14px',
                margin: 0,
                overflow: 'visible',
                whiteSpace: 'nowrap',
              }}
            >
              TONG ITS!
            </h1>
            <p
              style={{
                color: '#fbbf24',
                fontSize: 16,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: 2,
              }}
            >
              PERFECT HAND
            </p>
          </motion.div>

          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>
            <strong style={{ color: '#fbbf24' }}>{winner.name}</strong> cleared all cards with valid combinations!
          </p>

          <button
            className="gold-button"
            style={{
              padding: '12px 32px',
              borderRadius: 9999,
              fontSize: 16,
              fontWeight: 800,
              marginTop: 10,
              width: '100%',
            }}
            onClick={onDismiss}
          >
            VIEW SCOREBOARD
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
