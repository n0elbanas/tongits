export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // A=1, 2-10=face, J/Q/K=10
  rankIndex: number; // 1 (A) to 13 (K)
}

export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RANK_VALUES: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
};

export const RANK_INDICES: Record<Rank, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
};

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${rank}-${suit}`,
    suit,
    rank,
    value: RANK_VALUES[rank],
    rankIndex: RANK_INDICES[rank],
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    // Group primarily by suit, then by rankIndex
    if (a.suit !== b.suit) {
      return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    }
    return a.rankIndex - b.rankIndex;
  });
}

export function sortCardsByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (a.rankIndex !== b.rankIndex) {
      return a.rankIndex - b.rankIndex;
    }
    return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
}
