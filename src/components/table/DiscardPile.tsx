import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { Card } from '../../game/engine/cards';
import { PlayingCard } from '../cards/PlayingCard';

interface DiscardPileProps {
  discardPile: Card[];
  isPickable: boolean;
  onPickDiscard: () => void;
  onViewHistory: () => void;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({
  discardPile,
  isPickable,
  onPickDiscard,
  onViewHistory,
}) => {
  const count = discardPile.length;
  const topCard = count > 0 ? discardPile[count - 1] : null;

  // Render up to 3 cards beneath the top card with subtle rotational variations
  const visibleUnderCards = discardPile.slice(Math.max(0, count - 4), Math.max(0, count - 1));

  const getSubtleRotation = (index: number) => {
    const rotations = [-1.5, 1.2, -0.8, 1.6, -1.1];
    return rotations[index % rotations.length];
  };

  return (
    <div className="pile-slot">
      {/* Label row with eye button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
        <span className="pile-label" style={{ margin: 0 }}>Discard</span>
        {count > 0 && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onViewHistory}
            title={`View all ${count} discarded cards`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(251,191,36,0.15)',
              border: '1px solid rgba(251,191,36,0.4)',
              cursor: 'pointer',
              color: '#fbbf24',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <Eye size={12} />
          </motion.button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        {/* Previous cards stacked beneath with realistic rotational jitter */}
        {visibleUnderCards.map((card, idx) => {
          const rot = getSubtleRotation(idx);
          const xShift = (idx - 1) * 1.5;
          const yShift = (idx - 1) * 1;

          return (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                top: yShift,
                left: xShift,
                transform: `rotate(${rot}deg)`,
                opacity: 0.75 + idx * 0.08,
                zIndex: idx + 1,
                pointerEvents: 'none',
              }}
            >
              <PlayingCard card={card} isFaceUp={true} isDisabled={true} />
            </div>
          );
        })}

        {topCard ? (
          <motion.div
            style={{
              position: 'relative',
              zIndex: 10,
              transform: `rotate(${getSubtleRotation(count)}deg)`,
            }}
            whileHover={isPickable ? { scale: 1.05, y: -6 } : undefined}
            whileTap={isPickable ? { scale: 0.95 } : undefined}
            animate={
              isPickable
                ? {
                    boxShadow: [
                      '0 0 0px rgba(16, 185, 129, 0)',
                      '0 0 18px rgba(16, 185, 129, 0.85)',
                      '0 0 0px rgba(16, 185, 129, 0)',
                    ],
                  }
                : {}
            }
            transition={{ repeat: isPickable ? Infinity : 0, duration: 1.6 }}
          >
            <PlayingCard
              card={topCard}
              isFaceUp={true}
              isHighlighted={isPickable}
              isDisabled={!isPickable}
              onClick={isPickable ? onPickDiscard : undefined}
            />
            {isPickable && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px rgba(16, 185, 129, 0.5)',
                  zIndex: 30,
                  pointerEvents: 'none',
                  letterSpacing: '0.04em',
                }}
              >
                + FORM MELD
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div
            style={{
              width: 'clamp(44px, 8.8vw, 82px)',
              aspectRatio: '5/7',
              borderRadius: 'clamp(5px, 0.9vw, 8px)',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}
          >
            DISCARD
          </div>
        )}
      </div>

      {/* Card count badge */}
      {count > 0 && (
        <div style={{
          marginTop: 5,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
        }}>
          {count} card{count !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
