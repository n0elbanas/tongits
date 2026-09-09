import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CheckCircle2, Clock, X, Sparkles, Trophy } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { chipBankroll, STREAK_REWARDS, DailyRewardStatus } from '../../services/chipBankroll';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (reward: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const [rewardStatus, setRewardStatus] = useState<DailyRewardStatus>(() =>
    chipBankroll.getDailyRewardStatus()
  );
  const [justClaimed, setJustClaimed] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleClaim = () => {
    soundManager.playButtonClick();
    const result = chipBankroll.claimDailyReward();
    if (result.success) {
      soundManager.playTongitsFanfare();
      setJustClaimed(result.amount);
      setRewardStatus(chipBankroll.getDailyRewardStatus());
      onClaimSuccess?.(result.amount);
    }
  };

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
            maxWidth: 480,
            borderRadius: 24,
            padding: 'clamp(20px, 4vw, 30px)',
            backgroundColor: 'rgba(9, 26, 19, 0.96)',
            border: '2px solid #fbbf24',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(251, 191, 36, 0.25)',
            color: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
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

          {/* Header Icon */}
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.5 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.6)',
                marginBottom: 8,
              }}
            >
              <Gift size={28} color="#1a0f02" />
            </motion.div>

            <h2
              className="gold-gradient-text"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: '0.05em',
                margin: 0,
              }}
            >
              DAILY LOGIN REWARD
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>
              Log in daily to claim bigger chip jackpots!
            </p>
          </div>

          {/* Just Claimed Banner */}
          {justClaimed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)',
                border: '1px solid #10b981',
                textAlign: 'center',
                color: '#6ee7b7',
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={18} />
              <span>Reward Claimed: +{justClaimed} Chips Added to Bankroll!</span>
            </motion.div>
          )}

          {/* 7-Day Rewards Grid */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {STREAK_REWARDS.map((chips, index) => {
              const dayNum = index + 1;
              const isToday = dayNum === rewardStatus.streak;
              const isClaimedPast = dayNum < rewardStatus.streak || (!rewardStatus.canClaim && isToday);
              const isGrandDay = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  style={{
                    gridColumn: isGrandDay ? 'span 2' : 'span 1',
                    borderRadius: 12,
                    padding: isGrandDay ? '8px 12px' : '8px 4px',
                    backgroundColor: isToday && rewardStatus.canClaim
                      ? 'rgba(245, 158, 11, 0.25)'
                      : isClaimedPast
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isToday && rewardStatus.canClaim
                      ? '2px solid #fbbf24'
                      : isClaimedPast
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: isGrandDay ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isGrandDay ? 10 : 4,
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: isToday && rewardStatus.canClaim
                      ? '0 0 16px rgba(251, 191, 36, 0.4)'
                      : 'none',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                    {isGrandDay ? 'DAY 7 JACKPOT' : `DAY ${dayNum}`}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24' }}>
                    +{chips} 🪙
                  </div>

                  {isClaimedPast && (
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 2, fontSize: 10 }}>
                      <CheckCircle2 size={12} /> Claimed
                    </div>
                  )}

                  {isToday && rewardStatus.canClaim && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -6,
                        backgroundColor: '#fbbf24',
                        color: '#1a0f02',
                        fontSize: 8,
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: 9999,
                        letterSpacing: '0.05em',
                      }}
                    >
                      READY
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {rewardStatus.canClaim ? (
            <button
              className="gold-button"
              onClick={handleClaim}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 9999,
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.5)',
                cursor: 'pointer',
              }}
            >
              <Trophy size={18} fill="#1a0f02" />
              <span>CLAIM TODAY&apos;S +{rewardStatus.rewardAmount} CHIPS!</span>
            </button>
          ) : (
            <div
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                color: '#d1d5db',
              }}
            >
              <Clock size={16} color="#9ca3af" />
              <span>
                Today&apos;s reward claimed! Next reward unlocks in{' '}
                <strong style={{ color: '#fbbf24' }}>{rewardStatus.hoursUntilNextClaim}h</strong>
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
