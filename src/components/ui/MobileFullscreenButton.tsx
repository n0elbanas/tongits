import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUA = /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 1024;
  return (isMobileUA || isTouch) && isSmallScreen;
}

export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
  );
}

export function requestMobileFullscreen(): Promise<void> {
  const elem = document.documentElement as any;
  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    return elem.webkitRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    return elem.mozRequestFullScreen();
  } else if (elem.msRequestFullscreen) {
    return elem.msRequestFullscreen();
  }
  return Promise.resolve();
}

export function exitMobileFullscreen(): Promise<void> {
  const doc = document as any;
  if (doc.exitFullscreen) {
    return doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    return doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    return doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    return doc.msExitFullscreen();
  }
  return Promise.resolve();
}

export const MobileFullscreenButton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ONLY render for mobile devices! (Hidden on PC/Desktop)
  if (!isMobile) {
    return null;
  }

  const handleToggle = async () => {
    // Check if device is iOS Safari where requestFullscreen on documentElement is blocked by Apple
    const isIos = /iphone|ipod|ipad/i.test(navigator.userAgent);
    const hasFullscreenAPI = isFullscreenSupported();

    if (isIos && !hasFullscreenAPI) {
      // iOS Safari tip
      setShowIosTip(true);
      setTimeout(() => setShowIosTip(false), 4500);
      return;
    }

    try {
      if (isFullscreen) {
        await exitMobileFullscreen();
      } else {
        await requestMobileFullscreen();
      }
    } catch {
      // Browser prevented fullscreen or requires gesture
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 20,
          background: isFullscreen ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)',
          border: isFullscreen ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.2)',
          color: isFullscreen ? '#fbbf24' : '#e2e8f0',
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: isFullscreen ? '0 0 12px rgba(245, 158, 11, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          zIndex: 40,
          ...style,
        }}
      >
        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        <span>{isFullscreen ? 'EXIT' : 'FULLSCREEN'}</span>
      </button>

      {/* iOS Safari Home Screen Tip Modal */}
      <AnimatePresence>
        {showIosTip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: 340,
              padding: '14px 18px',
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8)',
              color: '#ffffff',
              fontSize: 12,
              textAlign: 'center',
              zIndex: 99999,
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#fbbf24', fontWeight: 800, marginBottom: 4 }}>
              <Smartphone size={16} />
              <span>Fullscreen on iPhone (iOS)</span>
            </div>
            <p style={{ margin: '4px 0 0', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.4 }}>
              Safari on iPhone restricts web fullscreen. For a 100% borderless app, tap <strong>Share</strong> (⎙) then <strong>"Add to Home Screen"</strong>!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
