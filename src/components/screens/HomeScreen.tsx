import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, BookOpen, Settings, Sparkles, Gift, Tv, Coins, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
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
          maxWidth: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Left Side: Avatar & Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Player Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px 3px 4px',
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
                width: 24,
                height: 24,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #fbbf24',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#f3f4f6',
                maxWidth: 80,
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
              gap: 5,
              padding: '4px 8px',
              borderRadius: 9999,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(180, 83, 9, 0.25) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fbbf24',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Coins size={13} color="#fbbf24" />
            <span>{chips.toLocaleString()}</span>
            <span
              style={{
                backgroundColor: '#fbbf24',
                color: '#1a0f02',
                borderRadius: '50%',
                width: 14,
                height: 14,
                fontSize: 10,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 1,
              }}
            >
              +
            </span>
          </button>
        </div>
      </header>

      {/* Main Container Card - Mobile First Zero-Scroll */}
      <motion.div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 420,
          borderRadius: 'clamp(16px, 3.5vw, 24px)',
          padding: 'clamp(12px, 2vh, 20px) clamp(14px, 3.2vw, 22px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(8px, 1.6vh, 14px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.12)',
          boxSizing: 'border-box',
          margin: 'auto 0',
        }}
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 220 }}
      >
        {/* Game Icon & Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: 'spring', damping: 14, stiffness: 180 }}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <img
              src="/icon.png"
              alt="Tongits"
              style={{
                width: 'clamp(52px, 9.5vh, 72px)',
                height: 'auto',
                filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.25))',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </motion.div>

          <h1
            className="gold-gradient-text"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(22px, 5.2vw, 30px)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              lineHeight: 1.1,
              margin: '2px 0 0 0',
            }}
          >
            Tongits
          </h1>
          <p
            style={{
              fontSize: 'clamp(9px, 2vw, 10.5px)',
              fontWeight: 600,
              color: '#fbbf24',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 1,
              opacity: 0.88,
            }}
          >
            Classic Filipino Card Game
          </p>
        </div>

        {/* Primary Play Mode Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.2vh, 9px)' }}>
          {/* PLAY SOLO */}
          <button
            className="gold-button"
            onClick={() => {
              soundManager.playButtonClick();
              onPlaySolo();
            }}
            style={{
              width: '100%',
              padding: 'clamp(10px, 1.6vh, 13px) 16px',
              borderRadius: 9999,
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Play size={16} fill="#1a0f02" />
            <span>PLAY SOLO (VS BOTS)</span>
          </button>

          {/* ONLINE MULTIPLAYER */}
          <button
            className="action-btn secondary"
            onClick={() => {
              soundManager.playButtonClick();
              onMultiplayer();
            }}
            style={{
              width: '100%',
              padding: 'clamp(8px, 1.4vh, 11px) 16px',
              borderRadius: 9999,
              fontSize: 'clamp(12px, 2.3vw, 13.5px)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#f3f4f6',
              cursor: 'pointer',
            }}
          >
            <Users size={15} color="#fbbf24" />
            <span>ONLINE MULTIPLAYER</span>
          </button>
        </div>

        {/* Quick Action Icon Dock: 4 Compact Icon Buttons with smaller text */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(5px, 1.4vw, 8px)',
          }}
        >
          {/* Free Chips (+100) */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setIsFreeChipsOpen(true);
            }}
            title="Free Chips Bonus"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 'clamp(7px, 1.2vh, 10px) 4px',
              borderRadius: 13,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <Tv size={17} color="#fbbf24" />
            <span style={{ fontSize: 'clamp(9px, 1.9vw, 10.5px)', fontWeight: 800, whiteSpace: 'nowrap' }}>
              Free Chips
            </span>
          </button>

          {/* Daily Gift */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setIsDailyRewardOpen(true);
            }}
            title="Daily Gift Reward"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 'clamp(7px, 1.2vh, 10px) 4px',
              borderRadius: 13,
              background: dailyStatus.canClaim ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: dailyStatus.canClaim ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
              color: dailyStatus.canClaim ? '#6ee7b7' : '#d1d5db',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <Gift size={17} color={dailyStatus.canClaim ? '#6ee7b7' : '#d1d5db'} />
            <span style={{ fontSize: 'clamp(9px, 1.9vw, 10.5px)', fontWeight: 800, whiteSpace: 'nowrap' }}>
              Daily Gift
            </span>
            {dailyStatus.canClaim && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
            )}
          </button>

          {/* How to Play */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onHowToPlay();
            }}
            title="How to Play and Rules"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 'clamp(7px, 1.2vh, 10px) 4px',
              borderRadius: 13,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f3f4f6',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <BookOpen size={17} color="#93c5fd" />
            <span style={{ fontSize: 'clamp(9px, 1.9vw, 10.5px)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Rules
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onSettings();
            }}
            title="Settings and Audio"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 'clamp(7px, 1.2vh, 10px) 4px',
              borderRadius: 13,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f3f4f6',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <Settings size={17} color="#e5e7eb" />
            <span style={{ fontSize: 'clamp(9px, 1.9vw, 10.5px)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Settings
            </span>
          </button>
        </div>
      </motion.div>

      {/* Footer Legal & Regulatory Disclaimer - Compact Single Row */}
      <footer
        style={{
          position: 'relative',
          zIndex: 30,
          width: '100%',
          maxWidth: 480,
          textAlign: 'center',
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 'clamp(9.5px, 1.8vw, 10.5px)',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <AlertCircle size={11} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span>Amusement only. Chips have no cash value.</span>
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setIsDisclaimerOpen(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#fbbf24',
            fontSize: 'clamp(9.5px, 1.8vw, 10.5px)',
            fontWeight: 600,
            textDecoration: 'underline',
            cursor: 'pointer',
            opacity: 0.85,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '1px 3px',
          }}
        >
          <ShieldCheck size={11} />
          <span>Legal</span>
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
