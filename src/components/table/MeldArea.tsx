import React from 'react';
import { motion } from 'framer-motion';
import { Meld } from '../../game/engine/melds';
import { Player } from '../../game/engine/gameState';
import { PlayingCard } from '../cards/PlayingCard';

interface MeldAreaProps {
  melds: Meld[];
  players: Player[];
  selectedSapawCardId?: string;
  validSapawMeldIds?: Set<string>;
  onMeldClick?: (meld: Meld) => void;
}

export const MeldArea: React.FC<MeldAreaProps> = ({
  melds,
  players,
  selectedSapawCardId,
  validSapawMeldIds = new Set(),
  onMeldClick,
}) => {
  const getOwnerName = (ownerId: string) => {
    const p = players.find((pl) => pl.id === ownerId);
    return p ? p.name : 'Player';
  };

  if (melds.length === 0) {
    return (
      <div className="table-melds-container empty-melds">
        <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
          No exposed melds on table yet
        </span>
      </div>
    );
  }

  return (
    <div className="table-melds-container">
      {melds.map((meld) => {
        const isValidSapawTarget = validSapawMeldIds.has(meld.id);

        return (
          <motion.div
            key={meld.id}
            className={`meld-group ${isValidSapawTarget ? 'sapaw-target' : ''}`}
            onClick={isValidSapawTarget && onMeldClick ? () => onMeldClick(meld) : undefined}
            whileHover={isValidSapawTarget ? { scale: 1.04, y: -2 } : undefined}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="meld-owner-badge">
              {getOwnerName(meld.ownerId)} • {meld.type.toUpperCase()}
            </div>

            {isValidSapawTarget && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                }}
              >
                + SAPAW
              </motion.div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
              {meld.cards.map((card, idx) => (
                <div
                  key={card.id}
                  style={{
                    marginLeft: idx === 0 ? 0 : 'clamp(-26px, -3.4vw, -16px)',
                  }}
                >
                  <PlayingCard card={card} isFaceUp={true} />
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
