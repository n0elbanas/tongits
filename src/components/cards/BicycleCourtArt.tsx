import React from 'react';
import type { Rank, Suit } from '../../game/engine/cards';

/**
 * BICYCLE CLASSIC Court Card Art
 *
 * Faithfully recreates the style of the classic Bicycle / USPCC standard
 * playing card face cards — the globally recognized reference deck.
 *
 * Key visual characteristics from the reference image:
 *   - Colorful illustrated figures with warm gold, red, blue, and purple robes
 *   - Decorative floral / scroll patterns in the robe/background panels
 *   - Double-ended (reversible) split layout with a horizontal center divider
 *   - Clean white card face (no ivory tint)
 *   - Corner rank + small suit pip in serif font style
 *   - "J", "Q", "K" letter overlaid on the figure's panel
 */

interface BicycleCourtProps {
  rank: Rank;
  suit: Suit;
}

export const BicycleCourtArt: React.FC<BicycleCourtProps> = ({ rank, suit }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const suitColor = isRed ? '#cc1111' : '#111111';

  // Classic Bicycle palette per card/suit
  const palette = {
    // Robe primary
    robe1: isRed ? '#c41616' : '#1a2d6e',
    // Robe secondary / inner
    robe2: isRed ? '#e85c1a' : '#2a4a9a',
    // Gold accents (crowns, belts, jewelry)
    gold: '#c9930a',
    goldLight: '#f0c030',
    goldDark: '#8a5c00',
    // Green for some robe panels
    green: '#1a6b30',
    greenLight: '#2da050',
    // Purple robe accent
    purple: '#6b1a8a',
    // Flesh tone
    skin: '#f0dcc0',
    skinShadow: '#d4a878',
    // Hair
    hair: '#1a1008',
    // White/near-white
    white: '#ffffff',
    offWhite: '#f8f4ee',
    // Suit color
    suit: suitColor,
  };

  // Helper: tiny suit symbol inline
  const Pip = ({ x, y, size = 7 }: { x: number; y: number; size?: number }) => {
    const h = size / 2;
    const s = size / 100;
    const t = `translate(${x - h}, ${y - h}) scale(${s})`;

    switch (suit) {
      case 'hearts':
        return <path transform={t} d="M50 88 C28 70 5 50 5 30 C5 14 18 6 32 6 C40 6 46 12 50 18 C54 12 60 6 68 6 C82 6 95 14 95 30 C95 50 72 70 50 88 Z" fill={suitColor} />;
      case 'diamonds':
        return <path transform={t} d="M50 4 L90 50 L50 96 L10 50 Z" fill={suitColor} />;
      case 'spades':
        return <path transform={t} d="M50 5 C36 22 10 38 10 55 C10 70 26 78 42 70 C38 82 34 90 30 96 L70 96 C66 90 62 82 58 70 C74 78 90 70 90 55 C90 38 64 22 50 5 Z" fill={suitColor} />;
      case 'clubs':
        return (
          <g transform={t}>
            <circle cx="50" cy="26" r="21" fill={suitColor} />
            <circle cx="28" cy="55" r="21" fill={suitColor} />
            <circle cx="72" cy="55" r="21" fill={suitColor} />
            <circle cx="50" cy="46" r="17" fill={suitColor} />
            <path d="M42 60 L40 95 L60 95 L58 60 Z" fill={suitColor} />
            <path d="M35 96 Q50 88 65 96 Z" fill={suitColor} />
          </g>
        );
    }
  };

  // Decorative floral scroll pattern (used in robe/background panels)
  const FloralPanel = ({
    x, y, w, h, fill, opacity = 0.4
  }: { x: number; y: number; w: number; h: number; fill: string; opacity?: number }) => (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill="none" />
      {/* Scroll swirls */}
      <path d={`M${x + 4} ${y + 4} Q${x + w / 2} ${y + 6} ${x + w - 4} ${y + 4}`} stroke={fill} strokeWidth="0.8" fill="none" />
      <path d={`M${x + 6} ${y + 8} C${x + 10} ${y + 14} ${x + w / 2} ${y + 10} ${x + w - 6} ${y + 8}`} stroke={fill} strokeWidth="0.7" fill="none" />
      <circle cx={x + w / 2} cy={y + h / 2} r="2" fill={fill} />
      <path d={`M${x + 6} ${y + h - 4} Q${x + w / 2} ${y + h - 6} ${x + w - 6} ${y + h - 4}`} stroke={fill} strokeWidth="0.8" fill="none" />
      {/* Diamond accents */}
      <polygon points={`${x + 8},${y + h / 2} ${x + 11},${y + h / 2 - 3} ${x + 14},${y + h / 2} ${x + 11},${y + h / 2 + 3}`} fill={fill} />
      <polygon points={`${x + w - 14},${y + h / 2} ${x + w - 11},${y + h / 2 - 3} ${x + w - 8},${y + h / 2} ${x + w - 11},${y + h / 2 + 3}`} fill={fill} />
    </g>
  );

  // ── KING: The iconic Bicycle King — red robe/blue mantle, ornate crown, sword ──
  const renderBicycleKing = () => (
    <g>
      {/* White card base */}
      <rect x="0" y="0" width="100" height="100" fill={palette.white} />

      {/* Robe — warm red with scroll side panels */}
      <path d="M6 100 C10 70 26 56 50 54 C74 56 90 70 94 100 Z" fill={palette.robe1} />
      {/* Blue inner mantle V */}
      <path d="M32 56 L50 92 L68 56 Z" fill={palette.robe2} />
      {/* Gold belt line */}
      <line x1="20" y1="74" x2="80" y2="74" stroke={palette.gold} strokeWidth="2" />
      {/* Scroll robe decoration */}
      <FloralPanel x={8} y={56} w={22} h={38} fill={palette.goldLight} opacity={0.35} />
      <FloralPanel x={70} y={56} w={22} h={38} fill={palette.goldLight} opacity={0.35} />

      {/* Ermine collar */}
      <path d="M28 58 C38 66 62 66 72 58 L76 70 C62 74 38 74 24 70 Z" fill={palette.offWhite} />
      <circle cx="34" cy="66" r="1.2" fill="#111" />
      <circle cx="42" cy="68" r="1.2" fill="#111" />
      <circle cx="50" cy="69" r="1.2" fill="#111" />
      <circle cx="58" cy="68" r="1.2" fill="#111" />
      <circle cx="66" cy="66" r="1.2" fill="#111" />

      {/* Sword (held to right side) */}
      <line x1="74" y1="28" x2="82" y2="94" stroke="#aab4c0" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="38" x2="78" y2="38" stroke={palette.gold} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="73" y="24" width="3.5" height="7" rx="1" fill={palette.gold} />

      {/* Neck */}
      <rect x="43" y="48" width="14" height="12" rx="4" fill={palette.skinShadow} />

      {/* Face */}
      <ellipse cx="50" cy="38" rx="13" ry="15" fill={palette.skin} />
      <ellipse cx="50" cy="43" rx="10" ry="6" fill={palette.skinShadow} opacity="0.2" />

      {/* Full beard */}
      <path d="M38 40 C38 54 44 60 50 60 C56 60 62 54 62 40" fill={palette.hair} opacity="0.7" />
      {/* Mustache */}
      <path d="M43 43 Q47 39 50 42 Q53 39 57 43 Q53 46 50 43 Q47 46 43 43 Z" fill={palette.hair} />
      {/* Eyebrows */}
      <path d="M41 30.5 Q44 28 48 31" stroke={palette.hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M52 31 Q56 28 59 30.5" stroke={palette.hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="44" cy="35" rx="2" ry="1.5" fill="#1a1412" />
      <ellipse cx="56" cy="35" rx="2" ry="1.5" fill="#1a1412" />
      <circle cx="44.6" cy="34.5" r="0.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="56.6" cy="34.5" r="0.5" fill="rgba(255,255,255,0.8)" />
      {/* Nose */}
      <path d="M50 34 L48 40 L52 40" stroke={palette.skinShadow} strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Hair */}
      <path d="M35 30 C36 14 44 10 52 10 C60 10 66 14 66 28 C62 20 56 18 50 18 C44 18 38 22 35 30 Z" fill={palette.hair} />

      {/* Crown — classic 5-point arched crown */}
      <path d="M34 22 L36 7 L42 15 L50 3 L58 15 L64 7 L66 22 Z" fill={palette.gold} />
      <rect x="34" y="20" width="32" height="3.5" rx="1" fill={palette.goldDark} />
      <circle cx="50" cy="3.5" r="2.2" fill={isRed ? '#cc1111' : '#2244aa'} />
      <circle cx="36.5" cy="7.5" r="1.4" fill={palette.goldLight} />
      <circle cx="63.5" cy="7.5" r="1.4" fill={palette.goldLight} />
      <circle cx="42.5" cy="12" r="1.2" fill={palette.goldLight} />
      <circle cx="57.5" cy="12" r="1.2" fill={palette.goldLight} />

      {/* "K" label in classic Bicycle style */}
      <text
        x="16" y="22"
        fontSize="14"
        fontWeight="900"
        fontFamily="Georgia, serif"
        fill={suitColor}
        textAnchor="middle"
        letterSpacing="-0.5"
      >K</text>
    </g>
  );

  // ── QUEEN: Classic Bicycle Queen — flower, flowing hair, open crown ──
  const renderBicycleQueen = () => (
    <g>
      <rect x="0" y="0" width="100" height="100" fill={palette.white} />

      {/* Gown */}
      <path d="M6 100 C12 70 28 58 50 56 C72 58 88 70 94 100 Z" fill={isRed ? '#c41616' : '#1a2d6e'} />
      {/* Gold lace bodice panel */}
      <path d="M34 58 C42 72 58 72 66 58 L50 88 Z" fill={palette.goldLight} opacity="0.25" />
      {/* Scroll robe panels */}
      <FloralPanel x={8} y={58} w={24} h={36} fill={palette.goldLight} opacity={0.3} />
      <FloralPanel x={68} y={58} w={24} h={36} fill={palette.goldLight} opacity={0.3} />
      {/* Gold belt */}
      <line x1="22" y1="74" x2="78" y2="74" stroke={palette.gold} strokeWidth="1.8" />

      {/* Neckline lace */}
      <path d="M30 60 C40 68 60 68 70 60" stroke={palette.offWhite} strokeWidth="1.5" fill="none" />

      {/* Flower scepter */}
      <line x1="74" y1="48" x2="80" y2="96" stroke="#2a7a1a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="74" cy="46" r="5" fill={isRed ? '#ef4444' : '#4488ee'} />
      <circle cx="74" cy="46" r="2.5" fill={palette.goldLight} />

      {/* Neck */}
      <rect x="44" y="48" width="12" height="12" rx="4" fill={palette.skinShadow} />

      {/* Face */}
      <ellipse cx="50" cy="38" rx="12" ry="14" fill={palette.skin} />

      {/* Eyes */}
      <ellipse cx="44" cy="36" rx="2.2" ry="1.7" fill="#1a1412" />
      <ellipse cx="56" cy="36" rx="2.2" ry="1.7" fill="#1a1412" />
      <circle cx="44.7" cy="35.5" r="0.6" fill="rgba(255,255,255,0.8)" />
      <circle cx="56.7" cy="35.5" r="0.6" fill="rgba(255,255,255,0.8)" />
      {/* Eyebrows — fine arches */}
      <path d="M40 33 Q44 30 48 33" stroke={palette.hair} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M52 33 Q56 30 60 33" stroke={palette.hair} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 36 L48 42 L52 42" stroke={palette.skinShadow} strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Lips */}
      <path d="M46 47 Q50 51 54 47" stroke="#b91c1c" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Long flowing dark hair */}
      <path d="M32 34 C32 14 42 8 50 8 C58 8 68 14 68 34 C68 50 66 62 64 68 C62 50 60 34 50 34 C40 34 38 50 36 68 C34 62 32 50 32 34 Z" fill={palette.hair} />

      {/* Crown — classic queen open crown */}
      <path d="M36 20 L38 8 L44 14 L50 4 L56 14 L62 8 L64 20 Z" fill={palette.gold} />
      <rect x="36" y="18" width="28" height="3" rx="1" fill={palette.goldDark} />
      <circle cx="50" cy="4.5" r="2" fill={isRed ? '#cc1111' : '#2244aa'} />
      <circle cx="38.5" cy="8.5" r="1.2" fill={palette.goldLight} />
      <circle cx="61.5" cy="8.5" r="1.2" fill={palette.goldLight} />

      {/* "Q" label */}
      <text x="16" y="22" fontSize="14" fontWeight="900" fontFamily="Georgia, serif" fill={suitColor} textAnchor="middle">Q</text>
    </g>
  );

  // ── JACK: Classic Bicycle Jack — plumed cap, halberd, youthful ──
  const renderBicycleJack = () => (
    <g>
      <rect x="0" y="0" width="100" height="100" fill={palette.white} />

      {/* Doublet / Tunic */}
      <path d="M8 100 C14 70 30 56 50 54 C70 56 86 70 92 100 Z" fill={isRed ? '#e85c1a' : '#1a5c30'} />
      {/* Gold gorget collar plate */}
      <path d="M30 58 C40 68 60 68 70 58 L74 70 C60 74 40 74 26 70 Z" fill={palette.gold} opacity="0.7" />
      {/* Inner vest panel */}
      <path d="M36 58 L50 88 L64 58 Z" fill={isRed ? '#1a2d6e' : '#c41616'} />
      {/* Robe scroll panels */}
      <FloralPanel x={8} y={58} w={22} h={36} fill={palette.goldLight} opacity={0.3} />
      <FloralPanel x={70} y={58} w={22} h={36} fill={palette.goldLight} opacity={0.3} />

      {/* Halberd weapon */}
      <line x1="74" y1="26" x2="82" y2="96" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 24 L78 18 L80 27 L74 30 Z" fill="#94a3b8" />
      <line x1="70" y1="34" x2="78" y2="34" stroke={palette.gold} strokeWidth="2.2" strokeLinecap="round" />

      {/* Neck */}
      <rect x="44" y="46" width="12" height="12" rx="4" fill={palette.skinShadow} />

      {/* Face — youthful, clean */}
      <ellipse cx="50" cy="36" rx="13" ry="15" fill={palette.skin} />

      {/* Eyes */}
      <ellipse cx="44" cy="34" rx="1.9" ry="1.4" fill="#1a1412" />
      <ellipse cx="56" cy="34" rx="1.9" ry="1.4" fill="#1a1412" />
      <circle cx="44.6" cy="33.5" r="0.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="56.6" cy="33.5" r="0.5" fill="rgba(255,255,255,0.8)" />
      {/* Eyebrows */}
      <path d="M40 31 Q44 29 48 31" stroke={palette.hair} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M52 31 Q56 29 60 31" stroke={palette.hair} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 34 L48 40 L52 40" stroke={palette.skinShadow} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      {/* Slight smile */}
      <path d="M46 44 Q50 48 54 44" stroke="#9a6240" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* Hair */}
      <path d="M34 30 C35 14 44 10 52 12 C62 14 68 20 67 32 C62 22 54 20 48 20 C40 20 36 24 34 30 Z" fill={palette.hair} />

      {/* Plumed cap — classic Bicycle Jack hat */}
      <path d="M32 22 C34 8 54 6 66 10 C72 14 70 24 62 24 L38 22 Z" fill={isRed ? '#1a2d6e' : '#c41616'} />
      {/* Plume feather */}
      <path d="M60 20 C66 12 72 6 78 2" stroke={palette.goldLight} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M60 20 C64 14 70 8 74 6" stroke={palette.gold} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Hat jewel */}
      <circle cx="48" cy="14" r="2.2" fill={isRed ? '#cc1111' : '#4488ee'} />

      {/* "J" label */}
      <text x="16" y="22" fontSize="14" fontWeight="900" fontFamily="Georgia, serif" fill={suitColor} textAnchor="middle">J</text>
    </g>
  );

  const renderTop = () => {
    switch (rank) {
      case 'K': return renderBicycleKing();
      case 'Q': return renderBicycleQueen();
      case 'J': return renderBicycleJack();
      default: return null;
    }
  };

  const uid = `bcc-${rank}-${suit}`;

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 3, overflow: 'hidden', backgroundColor: '#fff' }}>
      <svg viewBox="0 0 100 200" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <clipPath id={`${uid}-top`}><rect x="0" y="0" width="100" height="98" /></clipPath>
          <clipPath id={`${uid}-bot`}><rect x="0" y="102" width="100" height="98" /></clipPath>
        </defs>

        {/* Top half */}
        <g clipPath={`url(#${uid}-top)`}>{renderTop()}</g>

        {/* Center divider */}
        <rect x="0" y="98" width="100" height="4" fill="#f0f0f0" />
        <line x1="0" y1="98" x2="100" y2="98" stroke={suitColor} strokeWidth="0.8" opacity="0.4" />
        <line x1="0" y1="102" x2="100" y2="102" stroke={suitColor} strokeWidth="0.8" opacity="0.4" />
        {/* Center pip */}
        <circle cx="50" cy="100" r="7" fill="#fff" stroke={suitColor} strokeWidth="0.8" opacity="0.5" />
        <svg x="43" y="93" viewBox="0 0 100 100" width="14" height="14">
          <Pip x={50} y={50} size={80} />
        </svg>

        {/* Bottom half — 180° mirror */}
        <g transform="rotate(180 50 100)" clipPath={`url(#${uid}-top)`}>{renderTop()}</g>
      </svg>
    </div>
  );
};
