import React from 'react';
import { motion } from 'framer-motion';
import { Play, Users, BookOpen, Settings, Trophy, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';

interface HomeScreenProps {
  onPlaySolo: () => void;
  onMultiplayer: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlaySolo,
  onMultiplayer,
  onHowToPlay,
  onSettings,
}) => {
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
        justifyContent: 'center',
        padding: 'clamp(12px, 3vw, 24px)',
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

      {/* Main Container */}
      <motion.div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          maxHeight: '94dvh',
          borderRadius: 'clamp(20px, 4vw, 28px)',
          padding: 'clamp(20px, 4vh, 36px) clamp(16px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(16px, 3vh, 26px)',
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
              width: 'clamp(44px, 9vw, 56px)',
              height: 'clamp(44px, 9vw, 56px)',
              borderRadius: '50%',
              backgroundColor: '#133e31',
              border: '2px solid #fbbf24',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
              marginBottom: 8,
            }}
          >
            <Sparkles size={24} color="#fbbf24" />
          </motion.div>

          <h1
            className="gold-gradient-text"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 7vw, 44px)',
              fontWeight: 900,
              letterSpacing: '0.08em',
              lineHeight: 1.2,
              padding: '2px 8px',
              display: 'inline-block',
            }}
          >
            TONG ITS
          </h1>
          <p
            style={{
              fontSize: 'clamp(11px, 2.5vw, 13px)',
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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vh, 12px)' }}>
          {/* PLAY SOLO */}
          <button
            className="gold-button"
            onClick={() => {
              soundManager.playButtonClick();
              onPlaySolo();
            }}
            style={{
              width: '100%',
              padding: 'clamp(12px, 2vh, 16px) 20px',
              borderRadius: 9999,
              fontSize: 'clamp(14px, 2.5vw, 17px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Play size={18} fill="#1a0f02" />
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
              padding: 'clamp(10px, 1.8vh, 14px) 20px',
              borderRadius: 9999,
              fontSize: 'clamp(13px, 2.2vw, 15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            <Users size={18} color="#fbbf24" />
            <span>ONLINE MULTIPLAYER</span>
          </button>

          {/* HOW TO PLAY */}
          <button
            className="action-btn secondary"
            onClick={() => {
              soundManager.playButtonClick();
              onHowToPlay();
            }}
            style={{
              width: '100%',
              padding: 'clamp(10px, 1.8vh, 14px) 20px',
              borderRadius: 9999,
              fontSize: 'clamp(13px, 2.2vw, 15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <BookOpen size={17} />
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
              padding: 'clamp(10px, 1.8vh, 14px) 20px',
              borderRadius: 9999,
              fontSize: 'clamp(13px, 2.2vw, 15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Settings size={18} />
            <span>SETTINGS & AUDIO</span>
          </button>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>
          Pagat Canonical Rules • 3 Players • Standard 52-Card Deck
        </div>
      </motion.div>
    </div>
  );
};
