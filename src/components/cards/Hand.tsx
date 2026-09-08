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
            const rotationDeg = cardCount > 1 ? offsetFromMiddle * 1.0 : 0;
            const yOffset = Math.abs(offsetFromMiddle) * 0.7;

            const dynamicMarginLeft =
              index === 0
                ? 0
                : cardCount > 11
                ? 'clamp(-46px, -5.8vw, -24px)'
                : cardCount > 8
                ? 'clamp(-38px, -4.8vw, -20px)'
                : cardCount > 5
                ? 'clamp(-30px, -3.8vw, -16px)'
                : 'clamp(-20px, -2.5vw, -10px)';

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
                  y: isSelected ? -16 : yOffset,
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
