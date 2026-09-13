import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOT_PRESETS, BotProfile } from '../../game/ai/personalities';
import { AIDifficulty } from '../../game/engine/gameState';
import { Play, X, Check, Users, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { DEFAULT_AVATARS, OPTIONAL_AVATARS, getAvatarData } from '../../game/avatars/avatarData';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlayerName?: string;
  initialPlayerAvatar?: string;
  onStartGame: (config: {
    playerName: string;
    playerAvatar: string;
    bot1: BotProfile;
    bot2: BotProfile;
    difficulty: AIDifficulty;
  }) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  initialPlayerName,
  initialPlayerAvatar,
  onStartGame,
}) => {
  const [playerName, setPlayerName] = useState(initialPlayerName || 'Player');
  const [playerAvatar, setPlayerAvatar] = useState(initialPlayerAvatar || 'avatar-1');
  const [avatarCategory, setAvatarCategory] = useState<'DEFAULT' | 'OPTIONAL'>('DEFAULT');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');

  useEffect(() => {
    if (isOpen) {
      const storedName = localStorage.getItem('tongits_player_name');
      const storedAvatar = localStorage.getItem('tongits_player_avatar');
      if (initialPlayerName) setPlayerName(initialPlayerName);
      else if (storedName) setPlayerName(storedName);

      if (initialPlayerAvatar) setPlayerAvatar(initialPlayerAvatar);
      else if (storedAvatar) setPlayerAvatar(storedAvatar);
    }
  }, [isOpen, initialPlayerName, initialPlayerAvatar]);

  // We track bots by ID to dynamically filter out player's avatar
  const [bot1Id, setBot1Id] = useState<string>('bot-marco'); // Marco has avatar-5
  const [bot2Id, setBot2Id] = useState<string>('bot-sofia'); // Sofia has avatar-2

  // Whenever playerAvatar changes, ensure neither bot shares this avatar
  useEffect(() => {
    const normalizedUserAvatar = getAvatarData(playerAvatar).id;

    // Filter bots that do not share the player's avatar
    const validBots = BOT_PRESETS.filter(
      (b) => getAvatarData(b.avatar).id !== normalizedUserAvatar
    );

    let newBot1Id = bot1Id;
    let newBot2Id = bot2Id;

    const bot1Data = BOT_PRESETS.find((b) => b.id === newBot1Id);
    if (!bot1Data || getAvatarData(bot1Data.avatar).id === normalizedUserAvatar) {
      // Pick first valid bot not equal to bot2
      const candidate = validBots.find((b) => b.id !== newBot2Id) || validBots[0];
      if (candidate) newBot1Id = candidate.id;
    }

    const bot2Data = BOT_PRESETS.find((b) => b.id === newBot2Id);
    if (!bot2Data || getAvatarData(bot2Data.avatar).id === normalizedUserAvatar || newBot2Id === newBot1Id) {
      // Pick next valid bot not equal to newBot1Id
      const candidate = validBots.find((b) => b.id !== newBot1Id) || validBots[1] || validBots[0];
      if (candidate) newBot2Id = candidate.id;
    }

    if (newBot1Id !== bot1Id) setBot1Id(newBot1Id);
    if (newBot2Id !== bot2Id) setBot2Id(newBot2Id);
  }, [playerAvatar, bot1Id, bot2Id]);

  if (!isOpen) return null;

  const normalizedUserAvatar = getAvatarData(playerAvatar).id;

  // Available bot options for Bot 1 (excluding player avatar and current Bot 2)
  const availableBotsForBot1 = BOT_PRESETS.filter((b) => {
    const botAvatar = getAvatarData(b.avatar).id;
    return botAvatar !== normalizedUserAvatar && b.id !== bot2Id;
  });

  // Available bot options for Bot 2 (excluding player avatar and current Bot 1)
  const availableBotsForBot2 = BOT_PRESETS.filter((b) => {
    const botAvatar = getAvatarData(b.avatar).id;
    return botAvatar !== normalizedUserAvatar && b.id !== bot1Id;
  });

  const selectedBot1 = BOT_PRESETS.find((b) => b.id === bot1Id) || availableBotsForBot1[0] || BOT_PRESETS[0];
  const selectedBot2 = BOT_PRESETS.find((b) => b.id === bot2Id) || availableBotsForBot2[0] || BOT_PRESETS[1];

  const handleStart = () => {
    soundManager.playButtonClick();
    const finalName = playerName.trim() || 'Player';
    localStorage.setItem('tongits_player_name', finalName);
    localStorage.setItem('tongits_player_avatar', playerAvatar);
    onStartGame({
      playerName: finalName,
      playerAvatar,
      bot1: { ...selectedBot1, difficulty },
      bot2: { ...selectedBot2, difficulty },
      difficulty,
    });
  };

  const difficultyColors: Record<AIDifficulty, string> = {
    EASY: '#10b981',
    MEDIUM: '#f59e0b',
    HARD: '#ef4444',
  };

  const activeAvatarsList = avatarCategory === 'DEFAULT' ? DEFAULT_AVATARS : OPTIONAL_AVATARS;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 250,
          padding: 16,
        }}
      >
        <motion.div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: 540,
            borderRadius: 20,
            padding: 'clamp(14px, 2.5vh, 22px) clamp(14px, 3vw, 22px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 1.8vh, 16px)',
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
            <div>
              <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 4vw, 22px)', margin: 0 }}>
                MATCH SETUP
              </h2>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>
                Solo table opponents and character profile
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                padding: 6,
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

          {/* ── Your Character Section ── */}
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: 'clamp(8px, 1.6vh, 12px)',
              borderRadius: 14,
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            {/* Top row: Avatar Preview + Name Field + Avatar Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {/* Selected avatar thumbnail */}
              <div style={{ flexShrink: 0 }}>
                <PlayerAvatar
                  avatarId={normalizedUserAvatar}
                  name={playerName}
                  size={42}
                  status="YOUR_TURN"
                  showStatusRing={true}
                />
              </div>

              {/* Name input */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Player Name
                  </label>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{playerName.length}/16</span>
                </div>
                <input
                  type="text"
                  value={playerName}
                  maxLength={16}
                  placeholder="Enter name..."
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 10px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Avatar Category Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setAvatarCategory('DEFAULT');
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: avatarCategory === 'DEFAULT' ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                    color: avatarCategory === 'DEFAULT' ? '#1a0f02' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Users size={11} />
                  <span>Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setAvatarCategory('OPTIONAL');
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: avatarCategory === 'OPTIONAL' ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                    color: avatarCategory === 'OPTIONAL' ? '#1a0f02' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Sparkles size={11} />
                  <span>More</span>
                </button>
              </div>
            </div>

            {/* Avatar horizontal carousel row */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 2,
                scrollbarWidth: 'thin',
              }}
            >
              {activeAvatarsList.map((av) => {
                const isSelected = normalizedUserAvatar === av.id;
                return (
                  <motion.button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setPlayerAvatar(av.id);
                    }}
                    whileTap={{ scale: 0.94 }}
                    style={{
                      position: 'relative',
                      flex: '0 0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                      borderRadius: 12,
                      backgroundColor: isSelected ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? '0 0 10px rgba(251,191,36,0.35)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <PlayerAvatar
                      avatarId={av.id}
                      name={av.name}
                      size={40}
                      status={isSelected ? 'YOUR_TURN' : 'IDLE'}
                      showStatusRing={false}
                    />
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 1,
                          right: 1,
                          width: 13,
                          height: 13,
                          borderRadius: '50%',
                          backgroundColor: '#fbbf24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        }}
                      >
                        <Check size={8} color="#1a0f02" strokeWidth={3.5} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── AI Difficulty Inline Segmented Control ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Difficulty
              </label>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['EASY', 'MEDIUM', 'HARD'] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setDifficulty(diff);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 11.5,
                    backgroundColor: difficulty === diff ? `${difficultyColors[diff]}22` : 'rgba(255,255,255,0.04)',
                    border: difficulty === diff ? `1.5px solid ${difficultyColors[diff]}` : '1px solid rgba(255,255,255,0.08)',
                    color: difficulty === diff ? difficultyColors[diff] : '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* ── Opponents (2-Column Compact Grid) ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Opponents (Solo 1 vs 2)
              </label>
              <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)' }}>
                Excludes your character
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {/* Opponent 1 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
                  OPPONENT 1 (Left)
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 6px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(245,158,11,0.15)',
                    marginBottom: 6,
                  }}
                >
                  <PlayerAvatar avatarId={selectedBot1.avatar} name={selectedBot1.name} size={28} status="IDLE" showStatusRing={false} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: 11.5, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedBot1.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#fbbf24', textTransform: 'uppercase' }}>
                      {selectedBot1.personality}
                    </div>
                  </div>
                </div>

                <select
                  value={bot1Id}
                  onChange={(e) => {
                    soundManager.playButtonClick();
                    setBot1Id(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '5px 6px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#ffffff',
                    border: '1px solid rgba(245,158,11,0.25)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {availableBotsForBot1.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.personality.slice(0, 3)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Opponent 2 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
                  OPPONENT 2 (Right)
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 6px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(245,158,11,0.15)',
                    marginBottom: 6,
                  }}
                >
                  <PlayerAvatar avatarId={selectedBot2.avatar} name={selectedBot2.name} size={28} status="IDLE" showStatusRing={false} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: 11.5, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedBot2.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#fbbf24', textTransform: 'uppercase' }}>
                      {selectedBot2.personality}
                    </div>
                  </div>
                </div>

                <select
                  value={bot2Id}
                  onChange={(e) => {
                    soundManager.playButtonClick();
                    setBot2Id(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '5px 6px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#ffffff',
                    border: '1px solid rgba(245,158,11,0.25)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {availableBotsForBot2.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.personality.slice(0, 3)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Start Button ── */}
          <button
            type="button"
            className="gold-button"
            onClick={handleStart}
            style={{
              padding: '11px 20px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 2,
              cursor: 'pointer',
            }}
          >
            <Play size={16} fill="#1a0f02" />
            <span>START MATCH</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
