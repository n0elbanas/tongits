import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers } from 'lucide-react';
import type { Card } from '../../game/engine/cards';
import { PlayingCard } from '../cards/PlayingCard';

interface DiscardHistoryModalProps {
  isOpen: boolean;
  discardPile: Card[];
  onClose: () => void;
}

// Group cards by suit for an organised overview
const SUIT_ORDER = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export const DiscardHistoryModal: React.FC<DiscardHistoryModalProps> = ({
  isOpen,
  discardPile,
  onClose,
}) => {
  const [viewMode, setViewMode] = React.useState<'CHRONOLOGICAL' | 'BY_SUIT'>('CHRONOLOGICAL');

  const discardedSet = new Set(discardPile.map((c) => c.id));

  // Group by suit for suit-view
  const bySuit = SUIT_ORDER.map((suit) => ({
    suit,
    cards: discardPile.filter((c) => c.suit === suit),
  }));

  // All 52 cards organised by suit+rank for the "dead cards" grid
  const allCardsBySuit = SUIT_ORDER.map((suit) => ({
    suit,
    ranks: RANK_ORDER.map((rank) => {
      const discarded = discardPile.find((c) => c.suit === suit && c.rank === rank);
      return { rank, suit, discarded: !!discarded, card: discarded ?? null };
    }),
  }));

  const suitLabel: Record<string, string> = {
    spades: '♠ Spades',
    hearts: '♥ Hearts',
    diamonds: '♦ Diamonds',
    clubs: '♣ Clubs',
  };

  const suitColor: Record<string, string> = {
    spades: '#e2e8f0',
    hearts: '#fca5a5',
    diamonds: '#fca5a5',
    clubs: '#e2e8f0',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '16px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '88dvh',
              borderRadius: 22,
              background: 'rgba(10,22,18,0.96)',
              border: '1px solid rgba(245,158,11,0.25)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 40px rgba(245,158,11,0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Layers size={18} color="#fbbf24" />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 20,
                    fontWeight: 900,
                    background: 'linear-gradient(135deg,#fef08a,#f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}>
                    Discard History
                  </h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    {discardPile.length} card{discardPile.length !== 1 ? 's' : ''} discarded this round
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── View Toggle ── */}
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 22px',
              flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {([
                { id: 'CHRONOLOGICAL', label: 'Chronological' },
                { id: 'BY_SUIT', label: 'Dead Cards' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    backgroundColor: viewMode === tab.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                    border: viewMode === tab.id ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                    color: viewMode === tab.id ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 22px' }}>

              {/* CHRONOLOGICAL VIEW */}
              {viewMode === 'CHRONOLOGICAL' && (
                <div>
                  {discardPile.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '48px 0',
                      color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600,
                    }}>
                      No cards discarded yet
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14, letterSpacing: '0.04em' }}>
                        Oldest → Newest (top card is #{ discardPile.length })
                      </p>
                      {/* Reverse so newest appears last / on right */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px 8px',
                      }}>
                        {discardPile.map((card, idx) => (
                          <motion.div
                            key={card.id}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.018, type: 'spring', stiffness: 380, damping: 22 }}
                            style={{ position: 'relative' }}
                          >
                            {/* Order badge */}
                            <div style={{
                              position: 'absolute',
                              top: -8, left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'rgba(0,0,0,0.75)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: 6,
                              fontSize: 9,
                              fontWeight: 800,
                              color: idx === discardPile.length - 1 ? '#fbbf24' : 'rgba(255,255,255,0.45)',
                              padding: '1px 5px',
                              whiteSpace: 'nowrap',
                              zIndex: 2,
                            }}>
                              {idx === discardPile.length - 1 ? 'TOP' : `#${idx + 1}`}
                            </div>
                            <div style={{
                              transform: 'scale(0.72)',
                              transformOrigin: 'top center',
                              marginBottom: -22,
                              // Highlight the top card
                              filter: idx === discardPile.length - 1
                                ? 'drop-shadow(0 0 8px rgba(251,191,36,0.7))'
                                : 'none',
                            }}>
                              <PlayingCard card={card} isFaceUp isDisabled />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DEAD CARDS / BY-SUIT GRID VIEW */}
              {viewMode === 'BY_SUIT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
                    Greyed-out cards have been discarded and are no longer in play.
                  </p>
                  {allCardsBySuit.map(({ suit, ranks }) => {
                    const discardedCount = ranks.filter((r) => r.discarded).length;
                    return (
                      <div key={suit}>
                        {/* Suit row header */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                        }}>
                          <span style={{
                            fontSize: 15, fontWeight: 800,
                            color: suitColor[suit],
                          }}>
                            {suitLabel[suit]}
                          </span>
                          {discardedCount > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 800,
                              background: 'rgba(239,68,68,0.2)',
                              border: '1px solid rgba(239,68,68,0.4)',
                              color: '#fca5a5',
                              borderRadius: 6,
                              padding: '2px 7px',
                            }}>
                              {discardedCount} dead
                            </span>
                          )}
                        </div>

                        {/* 13 rank slots — horizontally scrollable on mobile */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 6 }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(13, 1fr)',
                            minWidth: 460,
                            gap: 4,
                          }}>
                          {ranks.map(({ rank, discarded, card }) => (
                            <div key={rank} style={{ position: 'relative' }}>
                              <div style={{
                                transform: 'scale(0.6)',
                                transformOrigin: 'top center',
                                marginBottom: -26,
                                opacity: discarded ? 0.35 : 1,
                                filter: discarded ? 'grayscale(0.8)' : 'none',
                                transition: 'opacity 0.3s',
                              }}>
                                {/* Show the actual card if discarded, otherwise show a ghost back */}
                                {discarded && card ? (
                                  <PlayingCard card={card} isFaceUp isDisabled />
                                ) : (
                                  <div style={{
                                    width: 'clamp(44px, 8.8vw, 82px)',
                                    aspectRatio: '5/7',
                                    borderRadius: 'clamp(5px,0.9vw,8px)',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.03)',
                                    gap: 2,
                                  }}>
                                    <span style={{
                                      fontSize: 11, fontWeight: 900,
                                      color: suitColor[suit],
                                      opacity: 0.8,
                                    }}>{rank}</span>
                                  </div>
                                )}
                              </div>
                              {/* Rank label below */}
                              <div style={{
                                textAlign: 'center',
                                fontSize: 9,
                                fontWeight: 700,
                                color: discarded ? '#ef4444' : 'rgba(255,255,255,0.3)',
                                paddingTop: 2,
                              }}>
                                {rank}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{
              padding: '12px 22px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {52 - discardPile.length} cards unaccounted for (in hands / stock)
              </span>
              <button
                className="action-btn secondary"
                onClick={onClose}
                style={{ padding: '7px 20px', fontSize: 13 }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
