import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Smartphone, Sparkles, Maximize2 } from 'lucide-react';
import { requestMobileFullscreen } from './MobileFullscreenButton';

export const OrientationPrompt: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if width is mobile/tablet range AND orientation is portrait
      const isNarrow = window.innerWidth <= 950;
      const isTall = window.innerHeight > window.innerWidth;
      setIsPortrait(isNarrow && isTall);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Also monitor screen.orientation if available
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', checkOrientation);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, []);

  // If user rotates to landscape, reset dismissed status so if they rotate back to portrait it prompts again
  useEffect(() => {
    if (!isPortrait) {
      setIsDismissed(false);
    }
  }, [isPortrait]);

  if (!isPortrait || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(3, 12, 9, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 360,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 20,
          }}
        >
          {/* Animated Rotating Phone Illustration */}
          <div
            style={{
              position: 'relative',
              width: 140,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Ambient gold glow pulse */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />

            {/* Circular rotating indicator arrows */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width: 124,
                height: 124,
                borderRadius: '50%',
                border: '1.5px dashed rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />

            {/* Phone Body with 0 -> -90deg rotation loop */}
            <motion.div
              animate={{
                rotate: [0, 0, -90, -90, 0],
                scale: [1, 1, 1.06, 1.06, 1],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                times: [0, 0.15, 0.45, 0.8, 1],
                ease: 'easeInOut',
              }}
              style={{
                position: 'relative',
                width: 62,
                height: 96,
                borderRadius: 14,
                backgroundColor: 'rgba(10, 28, 22, 0.92)',
                border: '2px solid #fbbf24',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(251, 191, 36, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 4px',
                boxSizing: 'border-box',
              }}
            >
              {/* Speaker / Camera Notch */}
              <div
                style={{
                  width: 18,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />

              {/* Screen Content: Playing Card suits and felt green preview */}
              <div
                style={{
                  width: '100%',
                  flex: 1,
                  margin: '4px 0',
                  borderRadius: 8,
                  background: 'radial-gradient(ellipse at center, #14533d 0%, #06261d 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                }}
              >
                <div style={{ display: 'flex', gap: 4, fontSize: 13, color: '#fbbf24' }}>
                  <span>♠</span>
                  <span style={{ color: '#ef4444' }}>♥</span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 }}>
                  TONG-ITS
                </div>
              </div>

              {/* Home indicator bar */}
              <div
                style={{
                  width: 22,
                  height: 2.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                }}
              />
            </motion.div>

            {/* Floating Rotation Icon Badge */}
            <motion.div
              animate={{
                rotate: [-20, 20, -20],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#fbbf24',
                color: '#1a0f02',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <RotateCw size={18} strokeWidth={2.6} />
            </motion.div>
          </div>

          {/* Prompt Copy */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 9999,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#fbbf24',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Sparkles size={12} />
              <span>Landscape Mode</span>
            </div>

            <h2
              className="gold-gradient-text"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '0.04em',
                margin: '0 0 8px',
                lineHeight: 1.2,
              }}
            >
              ROTATE YOUR DEVICE
            </h2>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.72)',
                margin: 0,
              }}
            >
              Tong-Its is built for widescreen gameplay. Turn your phone sideways for larger cards, full table view, and effortless play.
            </p>
          </div>

          {/* Fullscreen & Rotate button */}
          <button
            onClick={async () => {
              try {
                await requestMobileFullscreen();
              } catch {
                // Ignore if not permitted
              }
              setIsDismissed(true);
            }}
            className="action-btn primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 800,
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Maximize2 size={16} fill="#05110d" />
            <span>PLAY IN FULLSCREEN</span>
          </button>

          {/* Dismiss / Continue in portrait fallback button */}
          <button
            onClick={() => setIsDismissed(true)}
            style={{
              marginTop: -6,
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '6px 12px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
          >
            Continue in portrait anyway
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
