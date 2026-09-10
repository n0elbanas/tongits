import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, AlertCircle, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '16px',
        }}
        onClick={onClose}
      >
        <motion.div
          className="glass-panel"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 24,
            padding: 'clamp(20px, 4vw, 32px)',
            backgroundColor: 'rgba(9, 26, 19, 0.95)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.15)',
            color: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} color="#fbbf24" />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#fbbf24',
                    margin: 0,
                    letterSpacing: '0.05em',
                  }}
                >
                  LEGAL DISCLAIMER & TOS
                </h2>
                <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>
                  Social Casino & Amusement Guidelines
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Golden Highlight Box */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 14,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#fef3c7', fontWeight: 600 }}>
              &ldquo;This is a social card game for amusement purposes only. Chips have no real-world monetary value.&rdquo;
            </p>
          </div>

          {/* Detailed Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, lineHeight: 1.6, color: '#d1d5db' }}>
            <div>
              <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> 1. Strictly No Real-Money Gambling & No Cash-Outs
              </strong>
              <p style={{ margin: '4px 0 0 0' }}>
                All chips, points, and rewards in Tongits are 100% virtual and exist strictly for digital gameplay. Virtual chips
                <strong> cannot be converted, redeemed, transferred, or cashed out</strong> for real-world currency, tangible goods, or physical prizes under any circumstances.
              </p>
            </div>

            <div>
              <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> 2. Casual Social Casino Game Classification
              </strong>
              <p style={{ margin: '4px 0 0 0' }}>
                This platform is categorized globally as a <strong>Casual Social Game</strong> (equivalent to recreational digital board games such as Zynga Poker, Monopoly, and casual card simulations). It does not involve real-money wagering, betting, or payouts, and is compliant with international amusement entertainment standards.
              </p>
            </div>

            <div>
              <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> 3. Fair Play & Entertainment
              </strong>
              <p style={{ margin: '4px 0 0 0' }}>
                Games are played against authentic algorithmic AI personalities or peer-to-peer friends for recreational fun. Winning games or accumulating virtual chips does not imply future success at real-money gambling.
              </p>
            </div>

            <div>
              <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> 4. Age Recommendation
              </strong>
              <p style={{ margin: '4px 0 0 0' }}>
                This game is intended for an adult audience (18+ or legal age of majority in your jurisdiction) for amusement and social card strategy practice.
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            className="gold-button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              marginTop: 8,
              cursor: 'pointer',
            }}
          >
            I UNDERSTAND & AGREE
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
