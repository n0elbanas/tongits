import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../../game/engine/cards';
import { PlayingCard } from '../cards/PlayingCard';

interface StockPileProps {
  cards: Card[];
  isClickable: boolean;
  onDrawStock: () => void;
}

export const StockPile: React.FC<StockPileProps> = ({
  cards,
  isClickable,
  onDrawStock,
}) => {
  const count = cards.length;

  // Calculate physical deck thickness illusion (1 to 4 visible sub-layers)
  const layerCount = count >= 12 ? 4 : count >= 8 ? 3 : count >= 4 ? 2 : count >= 1 ? 1 : 0;

  return (
    <div className="pile-slot">
      <span className="pile-label">Stock</span>
      <div style={{ position: 'relative' }}>
        {count > 0 ? (
          <>
            {/* Physical Deck Thickness Layers with stepped edges */}
            {Array.from({ length: layerCount }).map((_, idx) => {
              const layerIdx = layerCount - idx;
              const xOffset = layerIdx * 1.5;
              const yOffset = layerIdx * 1.5;

              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: yOffset,
                    left: xOffset,
                    width: '100%',
                    height: '100%',
                    borderRadius: 'clamp(5px, 0.9vw, 8px)',
                    backgroundColor: idx % 2 === 0 ? '#faf8f2' : '#07231a',
                    border: '0.75px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: `${-xOffset}px ${yOffset}px 4px rgba(0, 0, 0, 0.35)`,
                    zIndex: idx,
                  }}
                />
              );
            })}

            {/* Top Interactive Card */}
            <motion.div
              style={{ position: 'relative', zIndex: 10 }}
              whileHover={isClickable ? { scale: 1.05, y: -6, rotate: -0.5 } : undefined}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
            >
              <PlayingCard
                isFaceUp={false}
                isDisabled={!isClickable}
                onClick={isClickable ? onDrawStock : undefined}
              />
            </motion.div>

            {/* Stock Count Pill */}
            <div className="stock-pile-count">{count}</div>
          </>
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
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
};
