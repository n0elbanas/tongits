import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Tv, X, Sparkles, CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { chipBankroll, RewardedAdStatus } from '../../services/chipBankroll';
import { googleH5Ads } from '../../services/googleH5Ads';

interface FreeChipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDailyReward?: () => void;
}

function formatCooldown(seconds: number): string {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

export const FreeChipsModal: React.FC<FreeChipsModalProps> = ({
  isOpen,
  onClose,
  onOpenDailyReward,
}) => {
  const [currentChips, setCurrentChips] = useState(() => chipBankroll.getChips());
  const [adStatus, setAdStatus] = useState<RewardedAdStatus>(() =>
    chipBankroll.getRewardedAdStatus()
  );
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [rewardSuccessMessage, setRewardSuccessMessage] = useState<string | null>(null);

  // Sync chips and ad status
  useEffect(() => {
    const handleChipsUpdate = (e: any) => {
      setCurrentChips(e.detail);
    };
    const handleAdWatched = () => {
      setAdStatus(chipBankroll.getRewardedAdStatus());
    };

    window.addEventListener('tongits_chips_updated', handleChipsUpdate);
    window.addEventListener('tongits_ad_watched', handleAdWatched);

    return () => {
      window.removeEventListener('tongits_chips_updated', handleChipsUpdate);
      window.removeEventListener('tongits_ad_watched', handleAdWatched);
    };
  }, []);

  // Cooldown countdown tick runner
  useEffect(() => {
    if (!isOpen) return;

    // Immediate sync on open
    setAdStatus(chipBankroll.getRewardedAdStatus());

    const interval = setInterval(() => {
      setAdStatus(chipBankroll.getRewardedAdStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Simulated ad video countdown runner when in test/fallback mode
  useEffect(() => {
    let timer: any;
    if (isWatchingAd && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isWatchingAd && countdown === 0) {
      // Completed ad playback
      setIsWatchingAd(false);
      chipBankroll.addChips(100);
      chipBankroll.recordRewardedAdWatch();
      soundManager.playChips();
      setRewardSuccessMessage('+100 Free Chips added to your bankroll!');
      setCountdown(5);
      setAdStatus(chipBankroll.getRewardedAdStatus());
    }
    return () => clearTimeout(timer);
  }, [isWatchingAd, countdown]);

  if (!isOpen) return null;

  const handleWatchAdClick = () => {
    if (!adStatus.canWatch) return;

    soundManager.playButtonClick();
    setRewardSuccessMessage(null);

    googleH5Ads.requestRewardedAd(
      {
        name: 'free_chips_modal',
        rewardAmount: 100,
        onStart: () => {
          // Pause audio if needed
        },
        onReward: (amount) => {
          chipBankroll.addChips(amount);
          chipBankroll.recordRewardedAdWatch();
          soundManager.playChips();
          setRewardSuccessMessage(`+${amount} Free Chips added to your bankroll!`);
          setAdStatus(chipBankroll.getRewardedAdStatus());
        },
        onDismiss: () => {
          // User closed ad early
        },
        onError: () => {
          // Fallback to simulated ad
          setIsWatchingAd(true);
          setCountdown(5);
        },
      },
      // Fallback runner for offline / dev simulation
      () => {
        setIsWatchingAd(true);
        setCountdown(5);
      }
    );
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
            maxWidth: 440,
            borderRadius: 24,
            padding: 'clamp(20px, 4vw, 30px)',
            backgroundColor: 'rgba(9, 26, 19, 0.96)',
            border: '2px solid #fbbf24',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(251, 191, 36, 0.25)',
            color: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {!isWatchingAd && (
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
          )}

          {/* Icon and Title */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                border: '2px solid #fbbf24',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
                marginBottom: 8,
              }}
            >
              <Coins size={28} color="#fbbf24" />
            </div>

            <h2
              className="gold-gradient-text"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '0.05em',
                margin: 0,
              }}
            >
              FREE CHIPS REWARD
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>
              Watch a sponsor video to claim +100 virtual chips!
            </p>
          </div>

          {/* Bankroll and Daily Limit Counter */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              gap: 8,
            }}
          >
            {/* Current Balance */}
            <div
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 14,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Bankroll:</span>
              <span style={{ fontSize: 15, color: '#fbbf24', fontWeight: 800 }}>
                🪙 {currentChips.toLocaleString()}
              </span>
            </div>

            {/* Daily Ad Tracker */}
            <div
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 14,
                backgroundColor: adStatus.remainingToday === 0
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(0, 0, 0, 0.4)',
                border: adStatus.remainingToday === 0
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Daily Free Ads:</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: adStatus.remainingToday === 0 ? '#ef4444' : '#6ee7b7',
                }}
              >
                {adStatus.remainingToday} / {adStatus.maxDaily} left
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {rewardSuccessMessage && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#6ee7b7',
                fontSize: 13,
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{rewardSuccessMessage}</span>
            </motion.div>
          )}

          {/* Watching Ad State (Google H5 Ads player preview) */}
          {isWatchingAd ? (
            <div
              style={{
                width: '100%',
                padding: '24px 16px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '3px solid rgba(96, 165, 250, 0.2)',
                  borderTopColor: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Google AdSense for Games (H5 Ads)
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                  Reward unlocks in {countdown}s...
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  Please watch the sponsor video to claim your +100 chips.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* State 1: Daily Limit Reached */}
              {adStatus.reason === 'DAILY_LIMIT_REACHED' ? (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fca5a5', fontWeight: 700, fontSize: 14 }}>
                    <ShieldAlert size={18} />
                    <span>Daily Ad Limit Reached (5/5)</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#d1d5db' }}>
                    You have watched all 5 free video ads for today. Limit resets at midnight!
                  </span>
                </div>
              ) : adStatus.reason === 'COOLDOWN' ? (
                /* State 2: Cooldown active (under 60s) */
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: 9999,
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#9ca3af',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'not-allowed',
                  }}
                >
                  <Clock size={18} />
                  <span>NEXT AD IN {formatCooldown(adStatus.cooldownRemainingSeconds)}</span>
                </button>
              ) : (
                /* State 3: Ready to Watch */
                <button
                  className="gold-button"
                  onClick={handleWatchAdClick}
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
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)',
                  }}
                >
                  <Tv size={18} fill="#1a0f02" />
                  <span>WATCH VIDEO AD (+100 CHIPS)</span>
                </button>
              )}

              {/* Optional: Check Daily Bonus */}
              {onOpenDailyReward && (
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onClose();
                    onOpenDailyReward();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 9999,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Check Daily Login Bonus (Up to +500)</span>
                </button>
              )}
            </div>
          )}

          {/* Policy & Compliance Note */}
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <AlertCircle size={12} style={{ flexShrink: 0 }} />
            <span>5 ads/day limit with progressive cooldowns (1m, 3m, 5m, 7m) protects against invalid traffic.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
