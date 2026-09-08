import React from 'react';
import { CardBackStyle, useDeckStyle } from '../../context/DeckStyleContext';

export interface CardBackOption {
  id: CardBackStyle;
  number: number;
  name: string;
  fullName: string;
  desc: string;
  image: string;
  accentColor: string;
}

export const CARD_BACK_OPTIONS: CardBackOption[] = [
  {
    id: 'CLASSIC_ROYAL',
    number: 1,
    name: 'Classic Royal',
    fullName: '1. Classic Royal',
    desc: 'Regal Crown & Gold Filigree',
    image: '/cards/backs/classic_royal.jpg',
    accentColor: '#fbbf24',
  },
  {
    id: 'VINTAGE_ELEGANCE',
    number: 2,
    name: 'Vintage Elegance',
    fullName: '2. Vintage Elegance',
    desc: 'Deep Crimson & Floral Rosette',
    image: '/cards/backs/vintage_elegance.jpg',
    accentColor: '#f43f5e',
  },
  {
    id: 'MODERN_GEOMETRIC',
    number: 3,
    name: 'Modern Geometric',
    fullName: '3. Modern Geometric',
    desc: 'Charcoal & Sacred Geometry',
    image: '/cards/backs/modern_geometric.jpg',
    accentColor: '#e5e7eb',
  },
  {
    id: 'OCEAN_MYSTIC',
    number: 4,
    name: 'Ocean Mystic',
    fullName: '4. Ocean Mystic',
    desc: 'Nautical Blue Waves & Star',
    image: '/cards/backs/ocean_mystic.jpg',
    accentColor: '#38bdf8',
  },
  {
    id: 'PHOENIX_FLAME',
    number: 5,
    name: 'Phoenix Flame',
    fullName: '5. Phoenix Flame',
    desc: 'Fiery Phoenix & Sacred Flame',
    image: '/cards/backs/phoenix_flame.jpg',
    accentColor: '#f97316',
  },
];

interface CardBackProps {
  backStyle?: CardBackStyle;
  className?: string;
  style?: React.CSSProperties;
}

export const CardBack: React.FC<CardBackProps> = ({ backStyle, className = '', style }) => {
  const { cardBackStyle } = useDeckStyle();
  const currentId = backStyle || cardBackStyle || 'CLASSIC_ROYAL';
  const currentOption =
    CARD_BACK_OPTIONS.find((opt) => opt.id === currentId) || CARD_BACK_OPTIONS[0];

  return (
    <div
      className={`playing-card back ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        backgroundColor: '#051b14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        ...style,
      }}
    >
      <img
        src={currentOption.image}
        alt={currentOption.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        loading="eager"
        draggable={false}
      />
    </div>
  );
};
