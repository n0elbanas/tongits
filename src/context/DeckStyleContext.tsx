import React, { createContext, useContext, useState, useEffect } from 'react';

export type CardFaceStyle = 'PREMIUM' | 'BICYCLE_CLASSIC';
export type CardBackStyle =
  | 'CLASSIC_ROYAL'
  | 'VINTAGE_ELEGANCE'
  | 'MODERN_GEOMETRIC'
  | 'OCEAN_MYSTIC'
  | 'PHOENIX_FLAME';
export type TableTheme = 'EMERALD' | 'ROYAL_BLUE' | 'CRIMSON';

export const VALID_CARD_BACKS: CardBackStyle[] = [
  'CLASSIC_ROYAL',
  'VINTAGE_ELEGANCE',
  'MODERN_GEOMETRIC',
  'OCEAN_MYSTIC',
  'PHOENIX_FLAME',
];

interface DeckStyleContextValue {
  cardFaceStyle: CardFaceStyle;
  setCardFaceStyle: (s: CardFaceStyle) => void;
  cardBackStyle: CardBackStyle;
  setCardBackStyle: (s: CardBackStyle) => void;
  tableTheme: TableTheme;
  setTableTheme: (t: TableTheme) => void;
}

const DeckStyleContext = createContext<DeckStyleContextValue>({
  cardFaceStyle: 'BICYCLE_CLASSIC',
  setCardFaceStyle: () => {},
  cardBackStyle: 'CLASSIC_ROYAL',
  setCardBackStyle: () => {},
  tableTheme: 'EMERALD',
  setTableTheme: () => {},
});

const LS_FACE = 'tongits_cardFaceStyle';
const LS_BACK = 'tongits_cardBackStyle';
const LS_TABLE = 'tongits_tableTheme';

export const DeckStyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cardFaceStyle, setCardFaceStyleState] = useState<CardFaceStyle>(
    () => (localStorage.getItem(LS_FACE) as CardFaceStyle) || 'BICYCLE_CLASSIC'
  );
  const [cardBackStyle, setCardBackStyleState] = useState<CardBackStyle>(() => {
    const saved = localStorage.getItem(LS_BACK) as CardBackStyle;
    return VALID_CARD_BACKS.includes(saved) ? saved : 'CLASSIC_ROYAL';
  });
  const [tableTheme, setTableThemeState] = useState<TableTheme>(
    () => (localStorage.getItem(LS_TABLE) as TableTheme) || 'EMERALD'
  );

  const setCardFaceStyle = (s: CardFaceStyle) => {
    setCardFaceStyleState(s);
    localStorage.setItem(LS_FACE, s);
  };
  const setCardBackStyle = (s: CardBackStyle) => {
    setCardBackStyleState(s);
    localStorage.setItem(LS_BACK, s);
  };
  const setTableTheme = (t: TableTheme) => {
    setTableThemeState(t);
    localStorage.setItem(LS_TABLE, t);
  };

  return (
    <DeckStyleContext.Provider
      value={{ cardFaceStyle, setCardFaceStyle, cardBackStyle, setCardBackStyle, tableTheme, setTableTheme }}
    >
      {children}
    </DeckStyleContext.Provider>
  );
};

export const useDeckStyle = () => useContext(DeckStyleContext);
