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
  const [activeTab, setActiveTab] = React.useState<'DECK' | 'AUDIO'>('DECK');
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
      description: 'Warm ivory, luxury art',
    },
    {
      id: 'BICYCLE_CLASSIC',
      name: 'Bicycle Classic',
      description: 'Crisp white, Bicycle art',
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
        padding: 'clamp(8px, 1.8vh, 16px) clamp(10px, 2.5vw, 16px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          zIndex: 20,
          flexShrink: 0,
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
        <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 4vw, 22px)', margin: 0 }}>
          SETTINGS
        </h2>
        <div style={{ width: 68 }} />
      </div>

      {/* Main Settings Panel */}
      <motion.div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 20,
          padding: 'clamp(12px, 2vh, 18px) clamp(12px, 3vw, 20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
          maxHeight: 'calc(100dvh - 75px)',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Segmented Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: 4,
            borderRadius: 14,
            border: '1px solid rgba(245, 158, 11, 0.25)',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('DECK');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 'clamp(11.5px, 2.4vw, 13px)',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: activeTab === 'DECK' ? '#fbbf24' : 'transparent',
              color: activeTab === 'DECK' ? '#1a0f02' : '#d1d5db',
              boxShadow: activeTab === 'DECK' ? '0 2px 8px rgba(251, 191, 36, 0.35)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Layers size={15} />
            <span>Deck Style</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('AUDIO');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 'clamp(11.5px, 2.4vw, 13px)',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: activeTab === 'AUDIO' ? '#fbbf24' : 'transparent',
              color: activeTab === 'AUDIO' ? '#1a0f02' : '#d1d5db',
              boxShadow: activeTab === 'AUDIO' ? '0 2px 8px rgba(251, 191, 36, 0.35)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Volume2 size={15} />
            <span>Audio & Motion</span>
          </button>
        </div>

        {/* Tab Content: DECK STYLE */}
        {activeTab === 'DECK' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 16px)' }}>
            {/* Card Face Style */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                <Layers size={15} />
                <span>Card Face Art</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {faceStyles.map((fs) => {
                  const isActive = cardFaceStyle === fs.id;
                  return (
                    <motion.button
                      key={fs.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        soundManager.playButtonClick();
                        setCardFaceStyle(fs.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 12,
                        backgroundColor: isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                        border: isActive ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: isActive ? '0 0 14px rgba(251,191,36,0.3)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.2s, background-color 0.2s',
                      }}
                    >
                      <CardStylePreview faceStyle={fs.id} suit={fs.id === 'BICYCLE_CLASSIC' ? 'hearts' : 'spades'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: isActive ? '#fbbf24' : '#f3f4f6' }}>{fs.name}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.25 }}>{fs.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Card Back Design - Compact Horizontal Carousel */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 800, fontSize: 13 }}>
                  <Palette size={15} />
                  <span>Card Back Design</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                  5 Exclusive Motifs
                </span>
              </div>

              {/* Horizontal Scroll / Compact Grid of 5 Card Backs */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 6,
                  scrollbarWidth: 'thin',
                }}
              >
                {CARD_BACK_OPTIONS.map((opt) => {
                  const isActive = cardBackStyle === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        soundManager.playButtonClick();
                        setCardBackStyle(opt.id);
                      }}
                      style={{
                        position: 'relative',
                        flex: '0 0 96px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px 6px',
                        borderRadius: 12,
                        backgroundColor: isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                        border: isActive ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.09)',
                        boxShadow: isActive ? '0 0 14px rgba(251,191,36,0.25)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {/* Card Back Thumbnail */}
                      <div
                        style={{
                          width: 44,
                          height: 61.6,
                          borderRadius: 5,
                          overflow: 'hidden',
                          boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          marginBottom: 6,
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

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 10.5,
                          color: isActive ? '#fbbf24' : '#f3f4f6',
                          lineHeight: 1.2,
                          maxWidth: 88,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {opt.name}
                      </div>

                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: '#fbbf24',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          <Check size={10} color="#1a0f02" strokeWidth={3.5} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: AUDIO & MOTION */}
        {activeTab === 'AUDIO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 16px)' }}>
            {/* Audio Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                <Volume2 size={15} />
                <span>Sound Effects</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Audio Effects</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Snaps, chimes & chips</div>
                  </div>
                  <button
                    className={`action-btn ${soundEnabled ? 'primary' : 'secondary'}`}
                    onClick={toggleSound}
                    style={{ padding: '6px 14px', fontSize: 12, fontWeight: 800 }}
                  >
                    {soundEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>

                {soundEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', minWidth: 50 }}>Volume:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#fbbf24' }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, width: 34, textAlign: 'right', color: '#fbbf24' }}>
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Animation Intensity Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                <Sparkles size={15} />
                <span>Animation Intensity</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['FULL', 'REDUCED', 'MINIMAL'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      soundManager.playButtonClick();
                      setAnimIntensity(mode);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      backgroundColor: animIntensity === mode ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                      color: animIntensity === mode ? '#1a0f02' : '#f3f4f6',
                      border: animIntensity === mode ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.3 }}>
                {animIntensity === 'FULL' && 'Full card deal paths, meld fly-overs & chip celebrations.'}
                {animIntensity === 'REDUCED' && 'Smoother transitions optimized for battery saving.'}
                {animIntensity === 'MINIMAL' && 'Instant card positioning with no motion overhead.'}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
