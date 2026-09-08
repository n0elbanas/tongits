import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../game/engine/cards';
import { MeldType } from '../../game/engine/melds';
import { Sparkles, Layers, ArrowUpCircle, Flame, Swords, ArrowDownRight, RefreshCw } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';

interface ActionBarProps {
  phase: string;
  isMyTurn: boolean;
  selectedCards: Card[];
  canDrawStock: boolean;
  canDrawDiscard: boolean;
  canMeld: boolean;
  meldType?: MeldType;
  canSapaw: boolean;
  canDiscard: boolean;
  canCallDraw: boolean;
  drawCallDisabledReason?: string;
  onDrawStock: () => void;
  onDrawDiscard: () => void;
  onMeld: () => void;
  onSapawStart: () => void;
  onDiscard: () => void;
  onCallDraw: () => void;
  onSortToggle: () => void;
  sortByRank: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  phase,
  isMyTurn,
  selectedCards,
  canDrawStock,
  canDrawDiscard,
  canMeld,
  meldType,
  canSapaw,
  canDiscard,
  canCallDraw,
  drawCallDisabledReason,
  onDrawStock,
  onDrawDiscard,
  onMeld,
  onSapawStart,
  onDiscard,
  onCallDraw,
  onSortToggle,
  sortByRank,
}) => {
  return (
    <div className="action-bar">
      {/* Sort Hand button */}
      <button
        className="action-btn secondary"
        onClick={() => {
          soundManager.playButtonClick();
          onSortToggle();
        }}
        title="Toggle sort hand by suit or rank"
      >
        <RefreshCw size={14} />
        <span>Sort: {sortByRank ? 'Rank' : 'Suit'}</span>
      </button>

      {/* CALL DRAW Button */}
      {isMyTurn && phase === 'PLAYER_TURN' && (
        <button
          className={`action-btn ${canCallDraw ? 'gold' : 'secondary'}`}
          disabled={!canCallDraw}
          onClick={() => {
            soundManager.playDrawCall();
            onCallDraw();
          }}
          title={!canCallDraw ? drawCallDisabledReason || 'Cannot call draw' : 'Call Draw to challenge opponents'}
        >
          <Flame size={15} />
          <span>CALL DRAW</span>
        </button>
      )}

      {/* DRAW FROM STOCK Button */}
      {isMyTurn && phase === 'PLAYER_TURN' && (
        <button
          className="action-btn primary"
          disabled={!canDrawStock}
          onClick={() => {
            soundManager.playCardFlick();
            onDrawStock();
          }}
        >
          <Layers size={15} />
          <span>DRAW STOCK</span>
        </button>
      )}

      {/* TAKE DISCARD Button */}
      {isMyTurn && phase === 'PLAYER_TURN' && (
        <button
          className={`action-btn ${canDrawDiscard ? 'primary' : 'secondary'}`}
          disabled={!canDrawDiscard}
          onClick={() => {
            soundManager.playMeld();
            onDrawDiscard();
          }}
          title={!canDrawDiscard ? 'Discard card does not form a valid meld with hand' : 'Take discard and expose meld'}
        >
          <ArrowDownRight size={15} />
          <span>TAKE DISCARD</span>
        </button>
      )}

      {/* MELD Button */}
      {isMyTurn && phase === 'AFTER_DRAW' && (
        <button
          className={`action-btn ${canMeld ? 'primary' : 'secondary'}`}
          disabled={!canMeld}
          onClick={() => {
            soundManager.playMeld();
            onMeld();
          }}
          title={!canMeld ? 'Select 3 or 4 cards forming a Set or Run' : `Meld ${meldType || 'Cards'}`}
        >
          <Sparkles size={15} />
          <span>MELD {meldType ? meldType.toUpperCase() : ''}</span>
        </button>
      )}

      {/* SAPAW Button */}
      {isMyTurn && phase === 'AFTER_DRAW' && (
        <button
          className={`action-btn ${canSapaw ? 'primary' : 'secondary'}`}
          disabled={!canSapaw}
          onClick={() => {
            soundManager.playSapaw();
            onSapawStart();
          }}
          title={!canSapaw ? 'Select 1 card that connects to a table meld' : 'Lay off onto table meld'}
        >
          <ArrowUpCircle size={15} />
          <span>SAPAW</span>
        </button>
      )}

      {/* DISCARD Button */}
      {isMyTurn && phase === 'AFTER_DRAW' && (
        <button
          className={`action-btn ${canDiscard ? 'danger' : 'secondary'}`}
          disabled={!canDiscard}
          onClick={() => {
            soundManager.playCardSnap();
            onDiscard();
          }}
          title={!canDiscard ? 'Select 1 card to discard and end turn' : 'Discard selected card'}
        >
          <Swords size={15} />
          <span>DISCARD ({selectedCards.length === 1 ? `${selectedCards[0].rank}${selectedCards[0].suit[0].toUpperCase()}` : '1'})</span>
        </button>
      )}
    </div>
  );
};
