import React from 'react';
import type { Rank, Suit } from '../../game/engine/cards';

/**
 * Classic French-Style Court Card Artwork
 *
 * Modeled after the traditional Bicycle Standard (USPCC) court card designs —
 * the most recognized face card artwork in the world. Features the canonical
 * double-ended (reversible) layout with gold/colored robes, held objects,
 * and period-appropriate costume details.
 *
 * The three classic face card archetypes:
 *   Jack  — youthful page/knave with plumed hat, holding a leaf/weapon
 *   Queen — sovereign with open crown, holding a flower/scepter
 *   King  — bearded monarch with arch crown, holding a sword/scepter
 */

interface CourtCardArtProps {
  rank: Rank;
  suit: Suit;
}

// Classic color palette for each suit
function getSuitPalette(suit: Suit) {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  return {
    isRed,
    // Primary robe / costume color
    primary: isRed ? '#c52828' : '#1a2744',
    // Secondary fabric color
    secondary: isRed ? '#8b1a1a' : '#0d1a30',
    // Accent / trim color
    accent: isRed ? '#f87171' : '#4b6fa0',
    // Gold for crowns, borders, ornamentation
    gold: '#c9a032',
    goldDark: '#8b6914',
    goldLight: '#e8d06a',
    // Skin tone (classic European card style)
    skin: '#f0d4b0',
    skinShadow: '#d4ad7a',
    // Hair colors vary by card
    hairDark: '#3d2b1a',
    hairLight: '#f7e9a0',
    // White / ermine
    white: '#f8f5ef',
    whiteShadow: '#d9d4ca',
  };
}

// Render a small suit pip in the SVG
function SuitPip({ suit, x, y, size = 8 }: { suit: Suit; x: number; y: number; size?: number }) {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const fill = isRed ? '#c52828' : '#1a2744';
  const half = size / 2;

  const transform = `translate(${x - half}, ${y - half}) scale(${size / 100})`;

  switch (suit) {
    case 'spades':
      return (
        <path
          transform={transform}
          d="M50 5 C38 22 15 38 15 55 C15 72 30 80 45 72 C42 82 38 90 35 95 L65 95 C62 90 58 82 55 72 C70 80 85 72 85 55 C85 38 62 22 50 5 Z"
          fill={fill}
        />
      );
    case 'hearts':
      return (
        <path
          transform={transform}
          d="M50 90 C28 70 8 50 8 32 C8 16 22 8 36 8 C44 8 48 14 50 18 C52 14 56 8 64 8 C78 8 92 16 92 32 C92 50 72 70 50 90 Z"
          fill={fill}
        />
      );
    case 'diamonds':
      return (
        <path
          transform={transform}
          d="M50 5 L90 50 L50 95 L10 50 Z"
          fill={fill}
        />
      );
    case 'clubs':
      return (
        <g transform={transform}>
          <circle cx="50" cy="28" r="20" fill={fill} />
          <circle cx="28" cy="56" r="20" fill={fill} />
          <circle cx="72" cy="56" r="20" fill={fill} />
          <circle cx="50" cy="46" r="16" fill={fill} />
          <path d="M42 58 L40 95 L60 95 L58 58 Z" fill={fill} />
        </g>
      );
  }
}

export const CourtCardArt: React.FC<CourtCardArtProps> = ({ rank, suit }) => {
  const p = getSuitPalette(suit);

  // ──────────────────────────────────────────────────────────────────
  // Each renderHalf() draws the TOP half of the figure (0,0)→(100,100).
  // The bottom half is the same SVG rotated 180° for classic reversible layout.
  // ──────────────────────────────────────────────────────────────────

  const renderKing = () => (
    <g>
      {/* ── Background band ── */}
      <rect x="0" y="0" width="100" height="100" fill={p.white} />
      <rect x="0" y="82" width="100" height="18" fill={p.secondary} opacity="0.15" />

      {/* ── Robe & Mantle ── */}
      <path d="M10 100 C14 72 28 58 50 56 C72 58 86 72 90 100 Z" fill={p.primary} />
      {/* Ermine collar / fur trim */}
      <path d="M26 60 C36 68 64 68 74 60 L78 74 C64 78 36 78 22 74 Z" fill={p.white} />
      {/* Ermine tails (black dots on white fur — classic card detail) */}
      <circle cx="32" cy="68" r="1.3" fill="#1a1412" />
      <circle cx="42" cy="70" r="1.3" fill="#1a1412" />
      <circle cx="50" cy="71" r="1.3" fill="#1a1412" />
      <circle cx="58" cy="70" r="1.3" fill="#1a1412" />
      <circle cx="68" cy="68" r="1.3" fill="#1a1412" />
      {/* Inner robe V-panel */}
      <path d="M38 60 L50 92 L62 60 Z" fill={p.accent} opacity="0.5" />
      {/* Gold belt / sash */}
      <rect x="24" y="74" width="52" height="3" rx="1" fill={p.gold} />

      {/* ── Sword behind the king (classic pose) ── */}
      <line x1="76" y1="24" x2="84" y2="96" stroke="#b0b8c4" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="72" y1="36" x2="80" y2="36" stroke={p.gold} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="74" y="22" width="4" height="8" rx="1" fill={p.gold} />

      {/* ── Neck ── */}
      <rect x="42" y="48" width="16" height="14" rx="5" fill={p.skinShadow} />

      {/* ── Face (classic rounded, slightly stylized) ── */}
      <ellipse cx="50" cy="38" rx="14" ry="16" fill={p.skin} />
      {/* Jaw shadow */}
      <ellipse cx="50" cy="44" rx="12" ry="8" fill={p.skinShadow} opacity="0.3" />

      {/* ── Full beard (classic king beard) ── */}
      <path d="M36 40 C36 56 42 62 50 62 C58 62 64 56 64 40" fill="none" />
      <path d="M38 42 C38 54 44 58 50 58 C56 58 62 54 62 42 Q62 52 50 56 Q38 52 38 42 Z" fill={p.hairDark} opacity="0.7" />
      {/* Mustache (classic handlebar style) */}
      <path d="M42 42 Q46 38 50 42 Q54 38 58 42 Q54 44 50 42 Q46 44 42 42 Z" fill={p.hairDark} />

      {/* ── Eyes (classic card style — simplified but expressive) ── */}
      <ellipse cx="44" cy="34" rx="2.2" ry="1.6" fill="#1a1412" />
      <ellipse cx="56" cy="34" rx="2.2" ry="1.6" fill="#1a1412" />
      <circle cx="44.6" cy="33.6" r="0.6" fill={p.white} />
      <circle cx="56.6" cy="33.6" r="0.6" fill={p.white} />
      {/* Eyebrows */}
      <path d="M40 31 Q44 28 48 31" stroke={p.hairDark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M52 31 Q56 28 60 31" stroke={p.hairDark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 34 L48 40 L52 40" stroke={p.skinShadow} strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* ── Hair (classic side-swept with volume) ── */}
      <path d="M34 30 C34 14 44 10 52 10 C60 10 68 14 68 28 C64 20 56 18 50 18 C44 18 38 22 34 30 Z" fill={p.hairDark} />

      {/* ── Crown (classic arched with cross pattée on top) ── */}
      <path d="M34 20 L36 6 L42 14 L50 2 L58 14 L64 6 L66 20 Z" fill={p.gold} />
      {/* Crown base band */}
      <rect x="34" y="18" width="32" height="4" rx="1" fill={p.goldDark} />
      {/* Crown jewels */}
      <circle cx="50" cy="3" r="2.5" fill={p.isRed ? '#dc2626' : '#2563eb'} />
      <circle cx="42" cy="10" r="1.5" fill={p.goldLight} />
      <circle cx="58" cy="10" r="1.5" fill={p.goldLight} />
      {/* Cross pattée atop */}
      <path d="M48 1 L50 -2 L52 1 Z" fill={p.gold} />
    </g>
  );

  const renderQueen = () => (
    <g>
      <rect x="0" y="0" width="100" height="100" fill={p.white} />
      <rect x="0" y="82" width="100" height="18" fill={p.secondary} opacity="0.12" />

      {/* ── Gown ── */}
      <path d="M8 100 C14 72 30 60 50 58 C70 60 86 72 92 100 Z" fill={p.primary} />
      {/* Bodice detail — embroidered V-panel */}
      <path d="M36 60 C44 76 56 76 64 60 L50 90 Z" fill={p.goldLight} opacity="0.35" />
      {/* Neckline lace */}
      <path d="M32 62 C40 68 60 68 68 62" stroke={p.white} strokeWidth="2" fill="none" />
      {/* Pearl / jewel necklace */}
      <circle cx="42" cy="62" r="1.4" fill={p.goldLight} />
      <circle cx="50" cy="64" r="1.8" fill={p.gold} />
      <circle cx="58" cy="62" r="1.4" fill={p.goldLight} />

      {/* ── Flower / scepter in hand (classic queen attribute) ── */}
      <line x1="74" y1="48" x2="80" y2="96" stroke="#5a8a3a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Flower head */}
      <circle cx="74" cy="46" r="4.5" fill={p.isRed ? '#ef4444' : '#60a5fa'} />
      <circle cx="74" cy="46" r="2" fill={p.goldLight} />

      {/* ── Neck ── */}
      <rect x="43" y="48" width="14" height="14" rx="5" fill={p.skinShadow} />

      {/* ── Face ── */}
      <ellipse cx="50" cy="38" rx="13" ry="15" fill={p.skin} />
      <ellipse cx="50" cy="42" rx="10" ry="6" fill={p.skinShadow} opacity="0.15" />

      {/* ── Eyes (larger, more feminine in classic style) ── */}
      <ellipse cx="44" cy="36" rx="2.4" ry="1.8" fill="#1a1412" />
      <ellipse cx="56" cy="36" rx="2.4" ry="1.8" fill="#1a1412" />
      <circle cx="44.8" cy="35.5" r="0.7" fill={p.white} />
      <circle cx="56.8" cy="35.5" r="0.7" fill={p.white} />
      {/* Eyebrows (thin arches) */}
      <path d="M40 33 Q44 30 48 33" stroke={p.hairDark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M52 33 Q56 30 60 33" stroke={p.hairDark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 36 L48 42 L52 42" stroke={p.skinShadow} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Lips (classic red) */}
      <path d="M46 47 Q50 51 54 47" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* ── Hair (long, flowing — classic queen) ── */}
      <path d="M32 34 C32 14 42 8 50 8 C58 8 68 14 68 34 C68 50 66 60 64 66 C62 48 60 34 50 34 C40 34 38 48 36 66 C34 60 32 50 32 34 Z" fill={p.hairDark} />

      {/* ── Open Crown / Coronet (classic queen's crown — open arches) ── */}
      <path d="M36 18 L38 8 L44 14 L50 4 L56 14 L62 8 L64 18 Z" fill={p.gold} />
      <rect x="36" y="16" width="28" height="3.5" rx="1" fill={p.goldDark} />
      <circle cx="50" cy="4" r="2" fill={p.isRed ? '#dc2626' : '#2563eb'} />
      <circle cx="38" cy="8" r="1.2" fill={p.goldLight} />
      <circle cx="62" cy="8" r="1.2" fill={p.goldLight} />
    </g>
  );

  const renderJack = () => (
    <g>
      <rect x="0" y="0" width="100" height="100" fill={p.white} />
      <rect x="0" y="82" width="100" height="18" fill={p.secondary} opacity="0.12" />

      {/* ── Tunic / Doublet ── */}
      <path d="M12 100 C18 72 32 58 50 56 C68 58 82 72 88 100 Z" fill={p.accent} />
      {/* Inner vest panel */}
      <path d="M38 58 L50 88 L62 58 Z" fill={p.primary} />
      {/* Gold gorget / collar plate */}
      <path d="M30 60 C40 68 60 68 70 60 L74 72 C60 76 40 76 26 72 Z" fill={p.gold} opacity="0.6" />

      {/* ── Halberd / Weapon (classic jack attribute) ── */}
      <line x1="74" y1="28" x2="82" y2="96" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Axe head */}
      <path d="M72 26 L78 20 L80 28 L74 32 Z" fill="#94a3b8" />
      <line x1="70" y1="34" x2="78" y2="34" stroke={p.gold} strokeWidth="2.5" strokeLinecap="round" />

      {/* ── Neck ── */}
      <rect x="43" y="46" width="14" height="14" rx="5" fill={p.skinShadow} />

      {/* ── Face (youthful, clean-shaven — classic jack) ── */}
      <ellipse cx="50" cy="36" rx="14" ry="16" fill={p.skin} />
      <ellipse cx="50" cy="40" rx="10" ry="6" fill={p.skinShadow} opacity="0.15" />

      {/* ── Eyes ── */}
      <ellipse cx="44" cy="34" rx="2" ry="1.4" fill="#1a1412" />
      <ellipse cx="56" cy="34" rx="2" ry="1.4" fill="#1a1412" />
      <circle cx="44.6" cy="33.5" r="0.5" fill={p.white} />
      <circle cx="56.6" cy="33.5" r="0.5" fill={p.white} />
      {/* Eyebrows */}
      <path d="M40 31 Q44 29 48 31" stroke={p.hairDark} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M52 31 Q56 29 60 31" stroke={p.hairDark} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 34 L48 40 L52 40" stroke={p.skinShadow} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Slight smile */}
      <path d="M46 45 Q50 48 54 45" stroke="#9a6240" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* ── Hair (thick, styled — page's hair) ── */}
      <path d="M33 30 C34 14 44 10 52 12 C62 14 68 20 67 32 C62 22 54 20 48 20 C40 20 36 24 33 30 Z" fill={p.hairDark} />

      {/* ── Plumed Beret / Cap (classic jack hat) ── */}
      <path d="M32 22 C34 8 54 6 66 10 C72 14 70 24 62 24 L38 22 Z" fill={p.primary} />
      {/* Feather plume */}
      <path d="M60 20 C66 12 72 6 78 2" stroke={p.goldLight} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M60 20 C64 14 68 10 72 8" stroke={p.gold} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Hat jewel */}
      <circle cx="48" cy="14" r="2.5" fill={p.isRed ? '#dc2626' : '#2563eb'} />
    </g>
  );

  const renderHalf = () => {
    switch (rank) {
      case 'K': return renderKing();
      case 'Q': return renderQueen();
      case 'J': return renderJack();
      default: return null;
    }
  };

  // Unique IDs for this specific card (avoids SVG ID collisions when multiple cards render)
  const uid = `court-${rank}-${suit}`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#faf8f2',
      }}
    >
      <svg
        viewBox="0 0 100 200"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-label={`${rank} of ${suit}`}
      >
        <defs>
          <clipPath id={`${uid}-top`}>
            <rect x="0" y="0" width="100" height="99" />
          </clipPath>
        </defs>

        {/* ── Top Half ── */}
        <g clipPath={`url(#${uid}-top)`}>
          {renderHalf()}
          {/* Small suit pip in top area */}
          <SuitPip suit={suit} x={14} y={90} size={10} />
        </g>

        {/* ── Center Divider (classic gold band with small suit medallion) ── */}
        <rect x="0" y="97.5" width="100" height="5" fill={p.gold} opacity="0.35" />
        <line x1="0" y1="97" x2="100" y2="97" stroke={p.gold} strokeWidth="1.5" />
        <line x1="0" y1="103" x2="100" y2="103" stroke={p.gold} strokeWidth="1.5" />
        <circle cx="50" cy="100" r="8" fill="#faf8f2" stroke={p.gold} strokeWidth="1.2" />
        <SuitPip suit={suit} x={50} y={100} size={10} />

        {/* ── Bottom Half (180° mirrored) ── */}
        <g transform="rotate(180 50 100)" clipPath={`url(#${uid}-top)`}>
          {renderHalf()}
          <SuitPip suit={suit} x={14} y={90} size={10} />
        </g>
      </svg>
    </div>
  );
};
