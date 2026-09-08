import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoundScoringResult } from '../../game/engine/scoring';
import { Player } from '../../game/engine/gameState';
import { Trophy, Flame, Coins, Award, ArrowRight } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface ScoreboardModalProps {
  isOpen: boolean;
  roundResult?: RoundScoringResult;
  players: Player[];
  sidePot: number;
  onNextRound: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  roundResult,
  players,
  sidePot,
  onNextRound,
}) => {
  if (!isOpen || !roundResult) return null;

  const winner = players.find((p) => p.id === roundResult.winnerId);

  const getWinReasonTitle = (reason: string) => {
    switch (reason) {
      case 'TONGITS':
        return 'TONG-ITS VICTORY';
      case 'DRAW_NO_CHALLENGE':
        return 'DRAW (ALL FOLDED)';
      case 'DRAW_WON_CHALLENGE':
        return 'DRAW CHALLENGE WON';
      case 'STOCK_EXHAUSTED':
        return 'STOCK EXHAUSTED (SHOWDOWN)';
      default:
        return 'ROUND COMPLETE';
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: 20,
        }}
      >
        <motion.div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: 580,
            maxHeight: '92dvh',
            overflowY: 'auto',
            borderRadius: 20,
            padding: 'clamp(16px, 3.5vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              style={{ display: 'inline-flex', marginBottom: 8 }}
            >
              <Trophy size={38} color="#fbbf24" />
            </motion.div>
            <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 26 }}>
              {getWinReasonTitle(roundResult.winReason)}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', marginTop: 2 }}>
              Winner: <strong style={{ color: '#fbbf24' }}>{winner?.name}</strong>
              {roundResult.sidePotWon && ' • Won the accumulated Side Pot! 🏆'}
            </p>
          </div>

          {/* Player Breakdown Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {players.map((player, idx) => {
              const breakdown = roundResult.playerBreakdowns[player.id];
              const isWinner = player.id === roundResult.winnerId;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    backgroundColor: isWinner ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: isWinner ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {/* Left: Avatar + Name + Sunog status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <PlayerAvatar
                      avatarId={player.avatar}
                      name={player.name}
                      size={36}
                      status={isWinner ? 'WINNER' : breakdown?.isSunog ? 'BURNED' : 'IDLE'}
                      showStatusRing={isWinner}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#f3f4f6' }}>
                          {player.name}
                        </span>
                        {isWinner && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: '#f59e0b', color: '#111827', padding: '1px 6px', borderRadius: 4 }}>
                            WINNER
                          </span>
                        )}
                        {breakdown?.isSunog && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: '#ef4444', color: '#ffffff', padding: '1px 6px', borderRadius: 4 }}>
                            SUNOG 🔥
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
                        Deadwood: {breakdown?.deadwood || 0} pts
                      </div>
                    </div>
                  </div>

                  {/* Right: Chip Delta + Total Chips */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 16,
                        color: breakdown && breakdown.chipDelta >= 0 ? '#10b981' : '#ef4444',
                      }}
                    >
                      {breakdown && breakdown.chipDelta >= 0 ? `+${breakdown.chipDelta}` : breakdown?.chipDelta} chips
                    </div>
                    <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
                      Total: {player.chips} 💰
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Side Pot Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px dashed rgba(245, 158, 11, 0.3)',
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 700 }}>
              <Coins size={16} />
              <span>Next Side Pot:</span>
            </div>
            <div style={{ fontWeight: 800, color: '#fbbf24' }}>
              {sidePot} Chips (Won on 2 consecutive wins)
            </div>
          </div>

          {/* Action Button */}
          <button
            className="gold-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 9999,
              fontSize: 15,
              marginTop: 6,
            }}
            onClick={() => {
              soundManager.playButtonClick();
              onNextRound();
            }}
          >
            <span>CONTINUE TO NEXT ROUND</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
