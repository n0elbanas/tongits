import React from 'react';
import type { Suit } from '../../game/engine/cards';

interface SuitProps {
  suit: Suit;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const SuitIcon: React.FC<SuitProps> = ({
  suit,
  size = 16,
  className = '',
  style,
}) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';

  const renderPath = () => {
    switch (suit) {
      case 'spades':
        // Crisp authentic Spade with arched crown and flared stem
        return (
          <path
            d="M50 8 C40 24 20 40 20 54 C20 68 31 76 43 76 C46 76 48 74 48 72 C48 76 44 88 38 92 L62 92 C56 88 52 76 52 72 C52 74 54 76 57 76 C69 76 80 68 80 54 C80 40 60 24 50 8 Z"
            fill="#141824"
          />
        );

      case 'hearts':
        // Sensual curved Heart with sharp bottom point and rich gradient
        return (
          <path
            d="M50 88 C32 72 14 54 14 36 C14 20 26 12 37 12 C44 12 48 16 50 20 C52 16 56 12 63 12 C74 12 86 20 86 36 C86 54 68 72 50 88 Z"
            fill="url(#heart-gradient)"
          />
        );

      case 'diamonds':
        // Faceted elongated luxury lozenge
        return (
          <path
            d="M50 10 L84 50 L50 90 L16 50 Z"
            fill="url(#diamond-gradient)"
          />
        );

      case 'clubs':
        // Classic 3-trefoil clover with flared pedestal stem
        return (
          <g fill="#141824">
            {/* Top leaf */}
            <circle cx="50" cy="30" r="18" />
            {/* Left leaf */}
            <circle cx="32" cy="54" r="18" />
            {/* Right leaf */}
            <circle cx="68" cy="54" r="18" />
            {/* Center connector */}
            <circle cx="50" cy="48" r="14" />
            {/* Stem */}
            <path d="M46 54 L44 90 L56 90 L54 54 Z" />
            <path d="M38 90 Q50 84 62 90 Z" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="diamond-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {renderPath()}
    </svg>
  );
};
