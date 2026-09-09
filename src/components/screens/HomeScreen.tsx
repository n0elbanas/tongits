import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, BookOpen, Settings, Sparkles, Gift, Tv, Coins, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { MobileFullscreenButton } from '../ui/MobileFullscreenButton';
import { chipBankroll, DailyRewardStatus } from '../../services/chipBankroll';
import { DailyRewardModal } from '../modals/DailyRewardModal';
import { FreeChipsModal } from '../modals/FreeChipsModal';
import { LegalDisclaimerModal } from '../modals/LegalDisclaimerModal';
import { getAvatarData } from '../../game/avatars/avatarData';

interface HomeScreenProps {
  onPlaySolo: () => void;
  onMultiplayer: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  playerName?: string;
  playerAvatar?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlaySolo,
  onMultiplayer,
  onHowToPlay,
  onSettings,
  playerName = 'Player',
  playerAvatar = 'avatar-1',
}) => {
  const [chips, setChips] = useState(() => chipBankroll.getChips());
  const [dailyStatus, setDailyStatus] = useState<DailyRewardStatus>(() =>
    chipBankroll.getDailyRewardStatus()
  );
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isFreeChipsOpen, setIsFreeChipsOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const avatarData = getAvatarData(playerAvatar);

  useEffect(() => {
    const handleChipsUpdate = (e: any) => {
      setChips(e.detail);
    };
    const handleDailyClaim = () => {
      setDailyStatus(chipBankroll.getDailyRewardStatus());
    };

    window.addEventListener('tongits_chips_updated', handleChipsUpdate);
    window.addEventListener('tongits_daily_reward_claimed', handleDailyClaim);

    return () => {
      window.removeEventListener('tongits_chips_updated', handleChipsUpdate);
      window.removeEventListener('tongits_daily_reward_claimed', handleDailyClaim);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#05110d',
        background: 'radial-gradient(ellipse at 50% 40%, #0d382b 0%, #071f18 60%, #020a07 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(10px, 2.5vw, 20px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient background decoration */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Bar: Player Profile & Virtual Bankroll */}
      <header
        style={{
          position: 'relative',
          zIndex: 40,
          width: '100%',
          maxWidth: 960,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        {/* Left Side: Avatar & Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Player Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 10px 3px 4px',
              borderRadius: 9999,
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <img
              src={avatarData.imageUrl}
              alt={playerName}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #fbbf24',
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#f3f4f6',
                maxWidth: 90,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {playerName}
            </span>
          </div>

          {/* Chips Balance Pill & Free Chips Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setIsFreeChipsOpen(true);
            }}
            title="Get Free Chips"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 9999,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(180, 83, 9, 0.25) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fbbf24',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Coins size={14} color="#fbbf24" />
            <span>{chips.toLocaleString()}</span>
            <span
              style={{
                backgroundColor: '#fbbf24',
                color: '#1a0f02',
                borderRadius: '50%',
                width: 15,
                height: 15,
                fontSize: 11,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 2,
              }}
            >
              +
            </span>
          </button>
        </div>

        {/* Right Side: Daily Gift & Fullscreen Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setIsDailyRewardOpen(true);
            }}
            title="Claim Daily Login Bonus"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 9999,
              background: dailyStatus.canClaim
                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)'
                : 'rgba(0, 0, 0, 0.55)',
              border: dailyStatus.canClaim
                ? '1.5px solid #fbbf24'
                : '1px solid rgba(255, 255, 255, 0.15)',
              color: dailyStatus.canClaim ? '#fbbf24' : '#9ca3af',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: dailyStatus.canClaim ? '0 0 15px rgba(251, 191, 36, 0.35)' : 'none',
              position: 'relative',
            }}
          >
            <Gift size={15} color={dailyStatus.canClaim ? '#fbbf24' : '#9ca3af'} />
            <span>Daily Gift</span>
            {dailyStatus.canClaim && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: 8,
                  fontWeight: 900,
                  padding: '1px 4px',
                  borderRadius: 9999,
                  marginLeft: 2,
                  letterSpacing: '0.04em',
                }}
              >
                FREE
              </span>
            )}
          </button>

          <MobileFullscreenButton />
        </div>
      </header>

      {/* Main Container Card */}
      <motion.div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 440,
          maxHeight: '82dvh',
          borderRadius: 'clamp(18px, 3.5vw, 26px)',
          padding: 'clamp(16px, 2.8vh, 26px) clamp(16px, 3.5vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(10px, 1.8vh, 18px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.15)',
          overflowY: 'auto',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        {/* Emblem & Title */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            style={{
              width: 'clamp(40px, 7.5vw, 50px)',
              height: 'clamp(40px, 7.5vw, 50px)',
              borderRadius: '50%',
              backgroundColor: '#133e31',
              border: '2px solid #fbbf24',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
              marginBottom: 4,
            }}
          >
            <Sparkles size={20} color="#fbbf24" />
          </motion.div>

          <h1
            className="gold-gradient-text"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(26px, 6.5vw, 38px)',
              fontWeight: 900,
              letterSpacing: '0.08em',
              lineHeight: 1.15,
              padding: '2px 8px',
              display: 'inline-block',
              margin: 0,
            }}
          >
            TONG ITS
          </h1>
          <p
            style={{
              fontSize: 'clamp(10.5px, 2.2vw, 12px)',
              fontWeight: 600,
              color: '#fbbf24',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 2,
              opacity: 0.9,
            }}
          >
            Classic Filipino Card Game
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(7px, 1.4vh, 10px)' }}>
          {/* PLAY SOLO */}
          <button
            className="gold-button"
            onClick={() => {
              soundManager.playButtonClick();
              onPlaySolo();
            }}
            style={{
              width: '100%',
              padding: 'clamp(11px, 1.8vh, 14px) 18px',
              borderRadius: 9999,
              fontSize: 'clamp(13.5px, 2.4vw, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Play size={17} fill="#1a0f02" />
            <span>PLAY SOLO (VS BOTS)</span>
          </button>

          {/* MULTIPLAYER */}
          <button
            className="action-btn secondary"
            onClick={() => {
              soundManager.playButtonClick();
              onMultiplayer();
            }}
            style={{
              width: '100%',
              padding: 'clamp(9px, 1.6vh, 12px) 18px',
              borderRadius: 9999,
              fontSize: 'clamp(12.5px, 2.1vw, 14.5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            <Users size={17} color="#fbbf24" />
            <span>ONLINE MULTIPLAYER</span>
          </button>

          {/* Monetization Rewards Row: Free Chips (Google H5 Ads) & Daily Reward */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
            <button
              className="action-btn secondary"
              onClick={() => {
                soundManager.playButtonClick();
                setIsFreeChipsOpen(true);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: 14,
                fontSize: 'clamp(11px, 2vw, 12.5px)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#fbbf24',
              }}
            >
              <Tv size={14} color="#fbbf24" />
              <span>+100 Free Chips</span>
            </button>

            <button
              className="action-btn secondary"
              onClick={() => {
                soundManager.playButtonClick();
                setIsDailyRewardOpen(true);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: 14,
                fontSize: 'clamp(11px, 2vw, 12.5px)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: dailyStatus.canClaim ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                border: dailyStatus.canClaim ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                color: dailyStatus.canClaim ? '#6ee7b7' : '#d1d5db',
              }}
            >
              <Gift size={14} />
              <span>Daily Gift</span>
              {dailyStatus.canClaim && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
              )}
            </button>
          </div>

          {/* HOW TO PLAY */}
          <button
            className="action-btn secondary"
            onClick={() => {
              soundManager.playButtonClick();
              onHowToPlay();
            }}
            style={{
              width: '100%',
              padding: 'clamp(8px, 1.5vh, 11px) 16px',
              borderRadius: 9999,
              fontSize: 'clamp(12px, 2vw, 13.5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <BookOpen size={15} />
            <span>HOW TO PLAY & RULES</span>
          </button>

          {/* SETTINGS */}
          <button
            className="action-btn secondary"
            onClick={() => {
              soundManager.playButtonClick();
              onSettings();
            }}
            style={{
              width: '100%',
              padding: 'clamp(8px, 1.5vh, 11px) 16px',
              borderRadius: 9999,
              fontSize: 'clamp(12px, 2vw, 13.5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Settings size={15} />
            <span>SETTINGS & AUDIO</span>
          </button>
        </div>
      </motion.div>

      {/* Footer Legal & Regulatory Disclaimer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 30,
          width: '100%',
          maxWidth: 620,
          textAlign: 'center',
          padding: '4px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(10px, 1.8vw, 11.5px)',
            lineHeight: 1.4,
            color: 'rgba(255, 255, 255, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            flexWrap: 'wrap',
          }}
        >
          <AlertCircle size={12} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span>This is a social card game for amusement purposes only. Chips have no real-world monetary value.</span>
        </p>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setIsDisclaimerOpen(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#fbbf24',
            fontSize: 'clamp(10px, 1.8vw, 11px)',
            fontWeight: 600,
            textDecoration: 'underline',
            cursor: 'pointer',
            opacity: 0.85,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 6px',
          }}
        >
          <ShieldCheck size={11} />
          <span>Legal Disclaimer & Terms</span>
        </button>
      </footer>

      {/* Modals */}
      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
      />

      <FreeChipsModal
        isOpen={isFreeChipsOpen}
        onClose={() => setIsFreeChipsOpen(false)}
        onOpenDailyReward={() => setIsDailyRewardOpen(true)}
      />

      <LegalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};
