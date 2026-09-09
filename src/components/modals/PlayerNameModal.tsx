import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Play, X, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { DEFAULT_AVATARS } from '../../game/avatars/avatarData';

interface PlayerNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, avatarId: string) => void;
  initialName?: string;
  initialAvatar?: string;
  mode?: 'SOLO' | 'MULTIPLAYER';
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialName = '',
  initialAvatar = 'avatar-1',
  mode = 'SOLO',
}) => {
  const [name, setName] = useState(initialName || '');
  const [avatarId, setAvatarId] = useState(initialAvatar || 'avatar-1');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const storedName = localStorage.getItem('tongits_player_name');
      const storedAvatar = localStorage.getItem('tongits_player_avatar');
      setName(storedName || initialName || '');
      if (storedAvatar) {
        setAvatarId(storedAvatar);
      } else if (initialAvatar) {
        setAvatarId(initialAvatar);
      }
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, initialName, initialAvatar]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim() || 'Player';
    soundManager.playButtonClick();
    localStorage.setItem('tongits_player_name', finalName);
    localStorage.setItem('tongits_player_avatar', avatarId);
    onConfirm(finalName, avatarId);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 220,
          padding: 16,
        }}
      >
        <motion.div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 24,
            padding: 'clamp(20px, 3.5vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <User size={24} />
              </div>
              <div>
                <h2
                  className="gold-gradient-text"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: 0, letterSpacing: '0.02em' }}
                >
                  ENTER YOUR NAME
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', margin: '3px 0 0' }}>
                  {mode === 'MULTIPLAYER'
                    ? 'Display name for multiplayer tables'
                    : 'Display name for solo match'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: 6,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name Input */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span>Player Name</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  {name.length}/16
                </span>
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  maxLength={16}
                  placeholder="Enter your name (e.g. CardMaster)"
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 16px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    border: '1.5px solid rgba(245, 158, 11, 0.35)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#fbbf24';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(251, 191, 36, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                Choose Avatar
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  paddingBottom: 6,
                  scrollbarWidth: 'thin',
                }}
              >
                {DEFAULT_AVATARS.map((av) => {
                  const isSelected = av.id === avatarId;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        setAvatarId(av.id);
                      }}
                      style={{
                        position: 'relative',
                        flex: '0 0 auto',
                        background: isSelected ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14,
                        padding: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <PlayerAvatar
                        avatarId={av.id}
                        name={av.name}
                        size={40}
                        status={isSelected ? 'YOUR_TURN' : 'IDLE'}
                        showStatusRing={isSelected}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isSelected ? '#fbbf24' : 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {av.name}
                      </span>
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: '#fbbf24',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={9} color="#1a0f02" strokeWidth={3.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '13px 20px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="gold-btn"
                style={{
                  flex: 2,
                  padding: '13px 20px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Play size={16} fill="currentColor" />
                <span>CONTINUE</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
