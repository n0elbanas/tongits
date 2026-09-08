import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../../game/engine/cards';
import { CardBack } from './CardBack';
import { useDeckStyle } from '../../context/DeckStyleContext';
import '../../styles/cards.css';

interface PlayingCardProps {
  card?: Card;
  isFaceUp?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  animateProps?: any;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp = true,
  isSelected = false,
  isHighlighted = false,
  isDisabled = false,
  onClick,
  onDoubleClick,
  style,
  className = '',
  animateProps,
}) => {
  const { cardFaceStyle } = useDeckStyle();
  const isBicycle = cardFaceStyle === 'BICYCLE_CLASSIC';

  // ── Face-down / no card: render the card back ──
  if (!isFaceUp || !card) {
    return (
      <motion.div
        className={`playing-card-container ${isDisabled ? 'disabled' : ''} ${className}`}
        style={style}
        onClick={!isDisabled ? onClick : undefined}
        whileHover={!isDisabled ? { y: -6, scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.96 } : undefined}
        {...animateProps}
      >
        <CardBack />
      </motion.div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const cardFolder = isBicycle ? 'classic' : 'premium';
  const cardImgUrl = `/cards/${cardFolder}/${card.rank}_${card.suit}.jpg`;

  return (
    <motion.div
      className={`playing-card front ${isBicycle ? 'classic-card-face' : 'premium-card-face'} ${isRed ? 'red' : 'black'} ${
        isSelected ? 'selected' : ''
      } ${isHighlighted ? 'meld-highlight' : ''} ${
        isDisabled ? 'disabled' : ''
      } ${className}`}
      style={{
        padding: 0,
        background: isBicycle ? '#ffffff' : '#fbf9f2',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isBicycle ? '1px solid rgba(0, 0, 0, 0.22)' : '1px solid rgba(0, 0, 0, 0.25)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
      onClick={!isDisabled ? onClick : undefined}
      onDoubleClick={!isDisabled ? onDoubleClick : undefined}
      tabIndex={!isDisabled ? 0 : -1}
      role="button"
      aria-label={`${card.rank} of ${card.suit}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      whileTap={!isDisabled ? { scale: 0.96 } : undefined}
      {...animateProps}
    >
      <img
        src={cardImgUrl}
        alt={`${card.rank} of ${card.suit}`}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          display: 'block',
          borderRadius: 'inherit',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 1,
        }}
      />
    </motion.div>
  );
};
