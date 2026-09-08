import { Card, createDeck } from './cards';

/**
 * Fisher-Yates unbiased shuffle.
 * Uses optional random generator function for deterministic testing.
 */
export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface DealResult {
  hands: Record<string, Card[]>;
  stock: Card[];
  dealerId: string;
}

/**
 * Deals cards to 3 players:
 * Dealer gets 13 cards.
 * Other two players get 12 cards each.
 * Remaining (52 - 37 = 15 cards) form the stock pile.
 */
export function dealCards(
  deck: Card[],
  dealerId: string,
  playerIds: string[]
): DealResult {
  if (playerIds.length !== 3) {
    throw new Error('Tong-its requires exactly 3 players');
  }
  if (!playerIds.includes(dealerId)) {
    throw new Error('Dealer must be one of the 3 players');
  }
  if (deck.length !== 52) {
    throw new Error('Deck must have 52 cards');
  }

  const hands: Record<string, Card[]> = {
    [playerIds[0]]: [],
    [playerIds[1]]: [],
    [playerIds[2]]: [],
  };

  const deckCopy = [...deck];

  // Dealing order starts with dealer or counter-clockwise from dealer.
  // Standard card dealing in Tong-its: 13 for dealer, 12 for others.
  // We can deal one by one or in blocks, resulting in:
  hands[dealerId] = deckCopy.splice(0, 13);
  const otherPlayers = playerIds.filter((id) => id !== dealerId);
  hands[otherPlayers[0]] = deckCopy.splice(0, 12);
  hands[otherPlayers[1]] = deckCopy.splice(0, 12);

  return {
    hands,
    stock: deckCopy, // 15 cards remaining
    dealerId,
  };
}
