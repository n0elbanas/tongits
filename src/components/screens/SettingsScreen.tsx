import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Sparkles, Palette, Layers, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { useDeckStyle, type CardFaceStyle } from '../../context/DeckStyleContext';
import { CARD_BACK_OPTIONS } from '../cards/CardBack';

interface SettingsScreenProps {
  onBack: () => void;
}

// Tiny card preview for the style picker
const CardStylePreview: React.FC<{ faceStyle: CardFaceStyle; suit?: 'hearts' | 'spades' }> = ({
  faceStyle,
  suit = 'hearts',
}) => {
  const isBicycle = faceStyle === 'BICYCLE_CLASSIC';
  const folder = isBicycle ? 'classic' : 'premium';

  return (
    <div
      style={{
        width: 48,
        height: 68,
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
        border: isBicycle ? '1px solid #ccc' : '1px solid #c9b037',
        background: isBicycle ? '#ffffff' : '#fbf9f2',
      }}
    >
      <img
        src={`/cards/${folder}/K_${suit}.jpg`}
        alt={`${faceStyle} Card Preview`}
        style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
      />
    </div>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.enabled);
  const [volume, setVolume] = React.useState(soundManager.volume);
  const [animIntensity, setAnimIntensity] = React.useState<'FULL' | 'REDUCED' | 'MINIMAL'>('FULL');

  const { cardFaceStyle, setCardFaceStyle, cardBackStyle, setCardBackStyle } = useDeckStyle();

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playButtonClick();
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    soundManager.volume = v;
  };

  const faceStyles: Array<{ id: CardFaceStyle; name: string; description: string }> = [
    {
      id: 'PREMIUM',
      name: 'Premium',
      description: 'Warm ivory, luxury illustrated art',
    },
    {
      id: 'BICYCLE_CLASSIC',
      name: 'Bicycle Classic',
      description: 'Crisp white, classic Bicycle-style art',
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        background: 'radial-gradient(ellipse at 50% 30%, #0e3b2e 0%, #061f18 70%, #020906 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(12px, 2vh, 24px) clamp(10px, 2vw, 16px)',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, zIndex: 20 }}>
        <button
          className="action-btn secondary"
          onClick={() => { soundManager.playButtonClick(); onBack(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
        >
          <ArrowLeft size={16} />
          <span>BACK</span>
        </button>
        <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 24, margin: 0 }}>
          SETTINGS
        </h2>
        <div style={{ width: 80 }} />
      </div>

      <motion.div
        className="glass-panel"
        style={{ width: '100%', maxWidth: 640, borderRadius: 20, padding: 'clamp(16px, 2.5vh, 24px) clamp(14px, 3vw, 28px)', display: 'flex', flexDirection: 'column', gap: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >

        {/* ── Card Face Style ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 800, fontSize: 16, marginBottom: 14 }}>
            <Layers size={18} />
            <span>Card Face Style</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {faceStyles.map((fs) => {
              const isActive = cardFaceStyle === fs.id;
              return (
                <motion.button
                  key={fs.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { soundManager.playButtonClick(); setCardFaceStyle(fs.id); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    backgroundColor: isActive ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)',
                    border: isActive ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 16px rgba(251,191,36,0.3)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.2s, background-color 0.2s',
                  }}
                >
                  {/* Live card preview */}
                  <CardStylePreview faceStyle={fs.id} suit={fs.id === 'BICYCLE_CLASSIC' ? 'hearts' : 'spades'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: isActive ? '#fbbf24' : '#f3f4f6' }}>{fs.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.3 }}>{fs.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Card Back Motif ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 800, fontSize: 16 }}>
              <Palette size={18} />
              <span>Card Back Design</span>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              5 Exclusive Backs
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {CARD_BACK_OPTIONS.map((opt) => {
              const isActive = cardBackStyle === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    soundManager.playButtonClick();
                    setCardBackStyle(opt.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 14,
                    backgroundColor: isActive ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)',
                    border: isActive ? '1.5px solid #fbbf24' : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive ? '0 0 16px rgba(251,191,36,0.25)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.2s, background-color 0.2s',
                    position: 'relative',
                  }}
                >
                  {/* Card Back Thumbnail */}
                  <div
                    style={{
                      width: 44,
                      height: 61.6,
                      borderRadius: 5,
                      overflow: 'hidden',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      flexShrink: 0,
                      position: 'relative',
                      background: '#05110d',
                    }}
                  >
                    <img
                      src={opt.image}
                      alt={opt.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      draggable={false}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: isActive ? '#fbbf24' : '#f3f4f6',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {opt.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: 3,
                        lineHeight: 1.25,
                      }}
                    >
                      {opt.desc}
                    </div>
                  </div>

                  {isActive && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      }}
                    >
                      <Check size={12} color="#1a0f02" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Audio ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
            <Volume2 size={18} />
            <span>Sound & Effects</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Sound Effects</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Card snaps, chimes, and chip audio</div>
            </div>
            <button
              className={`action-btn ${soundEnabled ? 'primary' : 'secondary'}`}
              onClick={toggleSound}
              style={{ padding: '8px 16px' }}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
          {soundEnabled && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Volume:</span>
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#fbbf24' }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, width: 36, textAlign: 'right' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* ── Animation Intensity ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
            <Sparkles size={18} />
            <span>Animation Intensity</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['FULL', 'REDUCED', 'MINIMAL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { soundManager.playButtonClick(); setAnimIntensity(mode); }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: animIntensity === mode ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                  color: animIntensity === mode ? '#1a0f02' : '#f3f4f6',
                  border: animIntensity === mode ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
