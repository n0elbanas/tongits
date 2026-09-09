import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../../game/engine/cards';
import { PlayingCard } from './PlayingCard';
import { soundManager } from '../../audio/soundEffects';

interface HandProps {
  cards: Card[];
  selectedCardIds: Set<string>;
  onCardToggle: (card: Card) => void;
  highlightCardIds?: Set<string>;
  disabled?: boolean;
}

export const Hand: React.FC<HandProps> = ({
  cards,
  selectedCardIds,
  onCardToggle,
  highlightCardIds = new Set(),
  disabled = false,
}) => {
  const cardCount = cards.length;

  return (
    <div className="player-hand-container">
      <div className="player-hand-cards">
        <AnimatePresence>
          {cards.map((card, index) => {
            const isSelected = selectedCardIds.has(card.id);
            const isHighlighted = highlightCardIds.has(card.id);

            // Calculate subtle dynamic fan angle and horizontal overlap
            const middleIndex = (cardCount - 1) / 2;
            const offsetFromMiddle = index - middleIndex;
            const rotationDeg = cardCount > 1 ? offsetFromMiddle * 0.65 : 0;
            const yOffset = Math.abs(offsetFromMiddle) * 0.25;

            const dynamicMarginLeft =
              index === 0
                ? 0
                : cardCount > 11
                ? 'clamp(-34px, -4.2vw, -24px)'
                : cardCount > 8
                ? 'clamp(-28px, -3.5vw, -20px)'
                : cardCount > 5
                ? 'clamp(-22px, -2.8vw, -14px)'
                : 'clamp(-16px, -2.0vw, -8px)';

            return (
              <motion.div
                key={card.id}
                className="card-wrapper"
                style={{
                  zIndex: isSelected ? 40 : index + 1,
                  marginLeft: dynamicMarginLeft,
                }}
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{
                  y: isSelected ? -14 : yOffset,
                  opacity: 1,
                  scale: 1,
                  rotate: isSelected ? 0 : rotationDeg,
                }}
                exit={{ y: -50, opacity: 0, scale: 0.6 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                <PlayingCard
                  card={card}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isDisabled={disabled}
                  onClick={() => {
                    soundManager.playCardFlick();
                    onCardToggle(card);
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
