import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayingCard } from '../cards/PlayingCard';
import { createCard } from '../../game/engine/cards';
import { ArrowLeft, BookOpen, Check, X, ShieldAlert, Sparkles, Flame } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';

interface TutorialScreenProps {
  onBack: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'melds' | 'turn' | 'sapaw' | 'draw' | 'scoring'>('basics');

  const setExample = [
    createCard('hearts', '7'),
    createCard('spades', '7'),
    createCard('diamonds', '7'),
  ];

  const runExampleValid = [
    createCard('hearts', 'A'),
    createCard('hearts', '2'),
    createCard('hearts', '3'),
  ];

  const runExampleInvalid = [
    createCard('spades', 'Q'),
    createCard('spades', 'K'),
    createCard('spades', 'A'),
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#05110d',
        background: 'radial-gradient(ellipse at 50% 30%, #0e3b2e 0%, #061f18 70%, #020906 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(12px, 2vh, 20px) clamp(8px, 2vw, 16px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          zIndex: 20,
        }}
      >
        <button
          className="action-btn secondary"
          onClick={() => {
            soundManager.playButtonClick();
            onBack();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 12 }}
        >
          <ArrowLeft size={15} />
          <span>BACK</span>
        </button>
        <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 3.5vw, 22px)', margin: 0 }}>
          HOW TO PLAY
        </h2>
        <div style={{ width: 60 }} />
      </div>

      {/* Main Container */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 800,
          flex: 1,
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'basics', label: '1. Objective' },
            { id: 'melds', label: '2. Sets & Runs' },
            { id: 'turn', label: '3. Turn Flow' },
            { id: 'sapaw', label: '4. Sapaw Lay-Off' },
            { id: 'draw', label: '5. Draw & Sunog' },
            { id: 'scoring', label: '6. Scoring & Pot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab(tab.id as any);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                backgroundColor: activeTab === tab.id ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === tab.id ? '#1a0f02' : '#f3f4f6',
                border: activeTab === tab.id ? '1px solid #d97706' : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: '#e5e7eb' }}>
          {activeTab === 'basics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ color: '#fbbf24', fontSize: 18 }}>Game Overview</h3>
              <p>
                <strong>Tongits</strong> is a popular 3-player rummy card game in the Philippines using a standard 52-card deck (no jokers).
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>The dealer receives <strong>13 cards</strong> and starts the round. Other 2 players receive <strong>12 cards</strong> each.</li>
                <li>The remaining 15 cards form the central <strong>Stock Pile</strong>.</li>
                <li>
                  Your goal is to form valid card combinations (<strong>Melds</strong>), lay off cards onto table melds (<strong>Sapaw</strong>), and minimize your unmelded cards (<strong>Deadwood</strong>).
                </li>
                <li>
                  You win by clearing all cards (<strong>Tongits!</strong>), having the lowest deadwood when the stock runs out, or successfully calling <strong>Draw</strong>.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'melds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ color: '#fbbf24', fontSize: 18 }}>Valid Melds (Sets & Runs)</h3>
              
              {/* SETS */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 14, borderRadius: 12 }}>
                <h4 style={{ color: '#10b981', marginBottom: 6 }}>1. SET (Three or Four of a Kind)</h4>
                <p style={{ fontSize: 13, marginBottom: 8 }}>3 or 4 cards of identical rank and different suits:</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {setExample.map((c) => (
                    <div key={c.id} style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}>
                      <PlayingCard card={c} isFaceUp={true} />
                    </div>
                  ))}
                </div>
              </div>

              {/* RUNS */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 14, borderRadius: 12 }}>
                <h4 style={{ color: '#10b981', marginBottom: 6 }}>2. RUN (Straight of Same Suit)</h4>
                <p style={{ fontSize: 13, marginBottom: 8 }}>
                  3 or more consecutive cards in the same suit. <strong style={{ color: '#fbbf24' }}>Ace is LOW</strong> (A-2-3 is valid, but Q-K-A is INVALID!):
                </p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <Check size={14} /> Valid Run (A-2-3):
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {runExampleValid.map((c) => (
                        <div key={c.id} style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                          <PlayingCard card={c} isFaceUp={true} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <X size={14} /> Invalid Run (Q-K-A cannot wrap!):
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {runExampleInvalid.map((c) => (
                        <div key={c.id} style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                          <PlayingCard card={c} isFaceUp={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'turn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ color: '#fbbf24', fontSize: 18 }}>Turn Structure</h3>
              <p>Turn order flows counter-clockwise. Each turn consists of:</p>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>DRAW</strong>: Draw 1 card from Stock OR pick the top card from Discard pile.
                  <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 2 }}>
                    ⚠️ Restriction: You can only take the top discard card if it IMMEDIATELY forms a valid new meld with your hand cards!
                  </div>
                </li>
                <li>
                  <strong>MELD (Optional)</strong>: Expose valid Sets or Runs from your hand onto the table.
                </li>
                <li>
                  <strong>SAPAW (Optional)</strong>: Add matching cards to any existing meld on the table.
                </li>
                <li>
                  <strong>DISCARD (Mandatory)</strong>: Discard 1 card to the central discard pile to end your turn.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'sapaw' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ color: '#fbbf24', fontSize: 18 }}>Sapaw (Lay-Off) Mechanics</h3>
              <p>
                <strong>Sapaw</strong> allows you to attach cards from your hand onto any exposed meld on the table:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Add the 4th suit to a 3-card Set on the table.</li>
                <li>Add adjacent cards to extend a Run on the table (e.g. adding 3♥ or 7♥ to 4♥-5♥-6♥).</li>
                <li>
                  <strong>Strategic Lock:</strong> If you Sapaw onto an opponent's meld, that opponent is <span style={{ color: '#ef4444', fontWeight: 700 }}>blocked from calling Draw</span> on their upcoming turn!
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'draw' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ color: '#fbbf24', fontSize: 18 }}>Calling Draw & Sunog (Burned)</h3>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>Calling Draw:</strong> If you have opened at least one meld and believe you have the lowest deadwood, you can call <strong>DRAW</strong> at the start of your turn before drawing.
                </li>
                <li>
                  <strong>Showdown:</strong> Eligible opponents who also opened can choose to <strong>FOLD</strong> or <strong>CHALLENGE</strong>.
                </li>
                <li>
                  <strong>Tie Rule:</strong> In a deadwood tie, the challenger beats the Draw caller!
                </li>
                <li>
                  <strong>SUNOG (Burned):</strong> If the round ends and a player has <span style={{ color: '#ef4444', fontWeight: 700 }}>never exposed any meld</span>, they are <strong>SUNOG</strong> (burned). They automatically lose and pay extra penalty chips!
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ color: '#fbbf24', fontSize: 18 }}>Canonical Scoring & Side Pot</h3>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Base Win:</strong> Winner collects +1 chip from each loser.</li>
                <li><strong>Tongits Win:</strong> +3 chips from each loser.</li>
                <li><strong>Draw Challenge Win:</strong> +3 chips from each challenger.</li>
                <li><strong>Ace Bonus:</strong> +1 chip for every Ace in winner's hand and exposed melds.</li>
                <li><strong>Secret 4-of-a-Kind:</strong> +3 chips for holding 4 of the same rank in hand.</li>
                <li><strong>Sunog Penalty:</strong> +1 chip penalty for each unopened player.</li>
                <li>
                  <strong>Side Pot:</strong> Every player puts 2 chips into the side pot before each hand. The player who wins <strong style={{ color: '#fbbf24' }}>2 consecutive games</strong> wins the entire accumulated Side Pot!
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
