import type { Card, Suit, Rank } from './cards';

export type MeldType = 'set' | 'run';

export interface Meld {
  id: string;
  type: MeldType;
  cards: Card[];
  ownerId: string;
  isSecret?: boolean; // For secret sets of 4 held in hand
}

/**
 * Validates if the given cards form a valid Set:
 * 3 or 4 cards of identical rank and distinct suits.
 */
export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3 || cards.length > 4) {
    return false;
  }
  const targetRank = cards[0].rank;
  const suits = new Set<Suit>();

  for (const card of cards) {
    if (card.rank !== targetRank) {
      return false;
    }
    if (suits.has(card.suit)) {
      return false; // duplicate suit not allowed
    }
    suits.add(card.suit);
  }

  return true;
}

/**
 * Validates if the given cards form a valid Run:
 * 3 or more consecutive cards of the exact same suit.
 * Ace is strictly LOW (A-2-3 valid, Q-K-A invalid).
 */
export function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3 || cards.length > 13) {
    return false;
  }

  const targetSuit = cards[0].suit;
  // Sort by rank index (A=1 ... K=13)
  const sorted = [...cards].sort((a, b) => a.rankIndex - b.rankIndex);

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].suit !== targetSuit) {
      return false;
    }
    if (i > 0) {
      if (sorted[i].rankIndex !== sorted[i - 1].rankIndex + 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates if a group of cards is either a valid Set or a valid Run.
 */
export function isValidMeld(cards: Card[]): { valid: boolean; type?: MeldType } {
  if (isValidSet(cards)) {
    return { valid: true, type: 'set' };
  }
  if (isValidRun(cards)) {
    return { valid: true, type: 'run' };
  }
  return { valid: false };
}

/**
 * Checks if adding `card` to `meld` creates a valid extended meld (Sapaw / Lay off).
 */
export function canSapaw(card: Card, meld: Meld): boolean {
  const extendedCards = [...meld.cards, card];
  if (meld.type === 'set') {
    return isValidSet(extendedCards);
  }
  if (meld.type === 'run') {
    return isValidRun(extendedCards);
  }
  return false;
}

/**
 * Finds all valid melds that can be formed using cards from the hand.
 */
export function findPossibleMelds(cards: Card[]): Card[][] {
  const results: Card[][] = [];

  // 1. Find all valid Sets (3 or 4 cards of same rank)
  const rankGroups: Record<Rank, Card[]> = {} as any;
  for (const card of cards) {
    if (!rankGroups[card.rank]) {
      rankGroups[card.rank] = [];
    }
    rankGroups[card.rank].push(card);
  }

  for (const rank in rankGroups) {
    const group = rankGroups[rank as Rank];
    if (group.length === 3) {
      if (isValidSet(group)) results.push([...group]);
    } else if (group.length === 4) {
      // 4-card set
      if (isValidSet(group)) results.push([...group]);
      // Also include the 3-card subsets
      for (let i = 0; i < 4; i++) {
        const subset = group.filter((_, idx) => idx !== i);
        if (isValidSet(subset)) results.push(subset);
      }
    }
  }

  // 2. Find all valid Runs (3+ consecutive cards of same suit)
  const suitGroups: Record<Suit, Card[]> = {
    spades: [],
    hearts: [],
    clubs: [],
    diamonds: [],
  };
  for (const card of cards) {
    suitGroups[card.suit].push(card);
  }

  for (const suit in suitGroups) {
    const group = suitGroups[suit as Suit].sort((a, b) => a.rankIndex - b.rankIndex);
    // Find all contiguous sequences of length >= 3
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 2; j < group.length; j++) {
        const sub = group.slice(i, j + 1);
        if (isValidRun(sub)) {
          results.push(sub);
        }
      }
    }
  }

  return results;
}

/**
 * Given cards in hand and a target card (e.g. discard pile top),
 * returns all combinations of cards from hand that when combined with targetCard
 * form a valid Set or Run.
 */
export function findMeldsWithTargetCard(handCards: Card[], targetCard: Card): Card[][] {
  const validMelds: Card[][] = [];

  // Check Sets: need 2 or 3 matching rank cards from hand with different suits
  const matchingRank = handCards.filter(
    (c) => c.rank === targetCard.rank && c.suit !== targetCard.suit
  );
  if (matchingRank.length >= 2) {
    // 2 cards from hand + targetCard = 3-card set
    for (let i = 0; i < matchingRank.length; i++) {
      for (let j = i + 1; j < matchingRank.length; j++) {
        const setCandidate = [matchingRank[i], matchingRank[j], targetCard];
        if (isValidSet(setCandidate)) {
          validMelds.push(setCandidate);
        }
      }
    }
    // 3 cards from hand + targetCard = 4-card set
    if (matchingRank.length >= 3) {
      const set4Candidate = [...matchingRank.slice(0, 3), targetCard];
      if (isValidSet(set4Candidate)) {
        validMelds.push(set4Candidate);
      }
    }
  }

  // Check Runs: matching suit
  const matchingSuit = handCards
    .filter((c) => c.suit === targetCard.suit && c.rankIndex !== targetCard.rankIndex)
    .sort((a, b) => a.rankIndex - b.rankIndex);

  // Combine hand cards with targetCard and check valid sub-runs containing targetCard
  const allSuitCards = [...matchingSuit, targetCard].sort((a, b) => a.rankIndex - b.rankIndex);

  for (let len = 3; len <= allSuitCards.length; len++) {
    for (let i = 0; i <= allSuitCards.length - len; i++) {
      const sub = allSuitCards.slice(i, i + len);
      if (sub.some((c) => c.id === targetCard.id) && isValidRun(sub)) {
        validMelds.push(sub);
      }
    }
  }

  return validMelds;
}

/**
 * Calculates sum of deadwood points in a list of cards.
 */
export function calculateDeadwood(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.value, 0);
}

/**
 * Identifies secret 4-of-a-kind sets in hand (awards +3 chips).
 */
export function findSecretFourOfAKind(hand: Card[]): Card[][] {
  const rankGroups: Record<Rank, Card[]> = {} as any;
  for (const card of hand) {
    if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
    rankGroups[card.rank].push(card);
  }

  const secretFours: Card[][] = [];
  for (const rank in rankGroups) {
    if (rankGroups[rank as Rank].length === 4) {
      secretFours.push(rankGroups[rank as Rank]);
    }
  }
  return secretFours;
}
