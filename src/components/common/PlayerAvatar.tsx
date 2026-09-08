import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getAvatarData } from '../../game/avatars/avatarData';

export type AvatarStatus = 'IDLE' | 'THINKING' | 'YOUR_TURN' | 'WINNER' | 'LOSER' | 'CHALLENGING' | 'BURNED';

interface PlayerAvatarProps {
  avatarId?: string;
  name?: string;
  size?: number | string;
  status?: AvatarStatus;
  showStatusRing?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatarId,
  name,
  size = 54,
  status = 'IDLE',
  showStatusRing = true,
  className = '',
  onClick,
}) => {
  const avatar = getAvatarData(avatarId);
  const [imgError, setImgError] = useState(false);
  const initials = (name || avatar.name).slice(0, 2).toUpperCase();

  const getStatusConfig = () => {
    switch (status) {
      case 'YOUR_TURN':
        return { stroke: '#fbbf24', glow: '0 0 16px rgba(251,191,36,0.85)', pulse: true };
      case 'THINKING':
        return { stroke: '#38bdf8', glow: '0 0 14px rgba(56,189,248,0.75)', pulse: true };
      case 'WINNER':
        return { stroke: '#f59e0b', glow: '0 0 24px rgba(245,158,11,0.9)', pulse: true };
      case 'BURNED':
        return { stroke: '#ef4444', glow: '0 0 16px rgba(239,68,68,0.8)', pulse: false };
      case 'LOSER':
        return { stroke: '#6b7280', glow: '0 0 8px rgba(107,114,128,0.6)', pulse: false };
      case 'CHALLENGING':
        return { stroke: '#a855f7', glow: '0 0 18px rgba(168,85,247,0.8)', pulse: true };
      default:
        return { stroke: 'rgba(255,255,255,0.25)', glow: 'none', pulse: false };
    }
  };

  const statusConfig = getStatusConfig();
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 54;

  return (
    <div
      className={`player-avatar-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      onClick={onClick}
    >
      {/* Animated Status Ring */}
      {showStatusRing && (
        <motion.div
          animate={statusConfig.pulse ? { scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `2.5px solid ${statusConfig.stroke}`,
            boxShadow: statusConfig.glow,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Main Avatar Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#0a1a15',
          border: '1.5px solid rgba(251, 191, 36, 0.35)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {!imgError ? (
          <img
            src={avatar.imageUrl}
            alt={avatar.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: avatar.accentColor || '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: numericSize * 0.36,
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
};
