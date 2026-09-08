import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrawCallState, Player } from '../../game/engine/gameState';
import { calculateDeadwood } from '../../game/engine/melds';
import { Swords, ShieldAlert, Flag } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface DrawModalProps {
  isOpen: boolean;
  drawState?: DrawCallState;
  players: Player[];
  humanPlayerId: string;
  onRespond: (response: 'FOLD' | 'CHALLENGE') => void;
}

export const DrawModal: React.FC<DrawModalProps> = ({
  isOpen,
  drawState,
  players,
  humanPlayerId,
  onRespond,
}) => {
  if (!isOpen || !drawState) return null;

  const caller = players.find((p) => p.id === drawState.callerId);
  const isHumanCaller = drawState.callerId === humanPlayerId;
  const isHumanEligible = drawState.eligibleOpponents.includes(humanPlayerId);
  const humanPlayer = players.find((p) => p.id === humanPlayerId);
  const humanDeadwood = humanPlayer ? calculateDeadwood(humanPlayer.hand) : 0;
  const humanHasResponded = drawState.responses[humanPlayerId] !== 'PENDING';

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
          zIndex: 210,
          padding: 20,
        }}
      >
        <motion.div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: '92dvh',
            overflowY: 'auto',
            borderRadius: 24,
            padding: 'clamp(16px, 3.5vw, 32px)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          {/* Icon + Title */}
          <div>
            <motion.div
              animate={{ rotate: [-8, 8, -8], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ display: 'inline-flex', marginBottom: 8 }}
            >
              <ShieldAlert size={44} color="#f59e0b" />
            </motion.div>
            <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 30 }}>
              DRAW CALLED!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, marginTop: 4 }}>
              <strong>{caller?.name}</strong> has called for a Showdown!
            </p>
          </div>

          {/* Decision Box for Human Player */}
          {!isHumanCaller && isHumanEligible && !humanHasResponded && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 16,
                padding: '16px 20px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <div style={{ fontSize: 14, color: '#f3f4f6', marginBottom: 12 }}>
                Your Current Deadwood: <strong style={{ color: '#fbbf24', fontSize: 18 }}>{humanDeadwood} pts</strong>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 16 }}>
                Challenge if you believe you have lower deadwood than {caller?.name}. In a tie, challengers win!
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  className="action-btn danger"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px 20px' }}
                  onClick={() => {
                    soundManager.playButtonClick();
                    onRespond('FOLD');
                  }}
                >
                  <Flag size={16} />
                  <span>FOLD</span>
                </button>

                <button
                  className="action-btn primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px 20px' }}
                  onClick={() => {
                    soundManager.playSapaw();
                    onRespond('CHALLENGE');
                  }}
                >
                  <Swords size={16} />
                  <span>CHALLENGE!</span>
                </button>
              </div>
            </div>
          )}

          {/* Status of Opponent responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.5)' }}>
              Opponent Decisions:
            </span>
            {drawState.eligibleOpponents.map((oppId) => {
              const p = players.find((pl) => pl.id === oppId);
              const status = drawState.responses[oppId];
              return (
                <div
                  key={oppId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlayerAvatar avatarId={p?.avatar} name={p?.name} size={28} showStatusRing={false} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#f3f4f6' }}>{p?.name}</span>
                  </div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 12,
                      color:
                        status === 'CHALLENGE'
                          ? '#10b981'
                          : status === 'FOLD'
                          ? '#ef4444'
                          : '#fbbf24',
                    }}
                  >
                    {status === 'PENDING' ? 'Deciding...' : status}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
