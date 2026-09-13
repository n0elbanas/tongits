import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Play, X, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { AVATARS_CATALOG } from '../../game/avatars/avatarData';

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
            maxWidth: 420,
            borderRadius: 20,
            padding: 'clamp(14px, 2.5vh, 22px) clamp(14px, 3vw, 22px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 2vh, 16px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.25)',
            maxHeight: '92dvh',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <User size={20} />
              </div>
              <div>
                <h2
                  className="gold-gradient-text"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(17px, 3.8vw, 20px)', margin: 0, letterSpacing: '0.02em' }}
                >
                  ENTER YOUR NAME
                </h2>
                <p style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.6)', margin: '2px 0 0' }}>
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
                padding: 5,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 14px)' }}>
            {/* Name Input */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
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
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    border: '1.5px solid rgba(245, 158, 11, 0.35)',
                    color: '#fff',
                    fontSize: 14,
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fbbf24',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Choose Avatar ({AVATARS_CATALOG.length})
                </label>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                  Swipe to browse all
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  scrollbarWidth: 'thin',
                }}
              >
                {AVATARS_CATALOG.map((av) => {
                  const isSelected = av.id === avatarId;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      title={av.name}
                      onClick={() => {
                        soundManager.playButtonClick();
                        setAvatarId(av.id);
                      }}
                      style={{
                        position: 'relative',
                        flex: '0 0 auto',
                        background: isSelected ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14,
                        padding: 3,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected ? '0 0 12px rgba(251,191,36,0.35)' : 'none',
                      }}
                    >
                      <PlayerAvatar
                        avatarId={av.id}
                        name={av.name}
                        size={46}
                        status={isSelected ? 'YOUR_TURN' : 'IDLE'}
                        showStatusRing={isSelected}
                      />
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
                            boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
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
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="gold-button"
                style={{
                  flex: 2,
                  padding: '10px 16px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Play size={15} fill="currentColor" />
                <span>CONTINUE</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
