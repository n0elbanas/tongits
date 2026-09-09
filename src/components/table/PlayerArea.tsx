import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../game/engine/gameState';
import { PlayingCard } from '../cards/PlayingCard';
import { PlayerAvatar } from '../common/PlayerAvatar';
import type { AvatarStatus } from '../common/PlayerAvatar';

interface PlayerAreaProps {
  player: Player;
  isActiveTurn: boolean;
  isDealer: boolean;
  isThinking?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom';
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({
  player,
  isActiveTurn,
  isDealer,
  isThinking = false,
  position = 'top-left',
}) => {
  const isOpponent = position !== 'bottom';

  const avatarStatus: AvatarStatus = isThinking
    ? 'THINKING'
    : isActiveTurn
    ? 'YOUR_TURN'
    : 'IDLE';

  return (
    <div className={`player-card ${isActiveTurn ? 'active-turn' : ''}`}>
      {/* Thinking pulse overlay */}
      {isThinking && (
        <motion.div
          className="thinking-indicator"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        >
          <span>Thinking…</span>
        </motion.div>
      )}

      {/* Avatar */}
      <div className="player-avatar-wrapper" style={{ position: 'relative', flexShrink: 0 }}>
        <PlayerAvatar
          avatarId={player.avatar}
          name={player.name}
          size={isOpponent ? 44 : 52}
          status={avatarStatus}
          showStatusRing={true}
        />
        {isDealer && (
          <div className="dealer-button">D</div>
        )}
      </div>

      {/* Player info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            fontWeight: 800,
            fontSize: 'clamp(11px, 1.4vw, 14px)',
            color: isActiveTurn ? '#fbbf24' : '#f3f4f6',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {player.name}
          </span>
          {player.opened && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '1px 5px',
              borderRadius: 4,
              border: '1px solid rgba(16, 185, 129, 0.3)',
              flexShrink: 0,
            }}>
              OPEN
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>
            ⬡ {player.chips}
          </span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{player.hand.length}c</span>
        </div>
      </div>

      {/* Opponent mini hand preview */}
      {isOpponent && (
        <div className="opponent-mini-hand" style={{ display: 'flex', marginLeft: 6, alignItems: 'center', flexShrink: 0 }}>
          {Array.from({ length: Math.min(player.hand.length, 3) }).map((_, idx) => (
            <div
              key={idx}
              className="opponent-card-back"
              style={{
                marginLeft: idx === 0 ? 0 : -10,
                transform: `rotate(${(idx - 1) * 4}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
