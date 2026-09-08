import { Card } from '../engine/cards';
import { Meld, findPossibleMelds, canSapaw, calculateDeadwood } from '../engine/melds';
import { GameState, Player } from '../engine/gameState';

/**
 * Calculates how "useful" a card is in the hand based on potential future melds (pairs, near-runs).
 * Lower usefulness score = better candidate to discard.
 */
export function evaluateCardUsefulness(card: Card, hand: Card[], exposedMelds: Meld[]): number {
  let score = 0;

  // 1. Check if card is part of a pair (potential Set)
  const sameRankCount = hand.filter((c) => c.rank === card.rank && c.id !== card.id).length;
  if (sameRankCount === 1) score += 4; // Pair
  if (sameRankCount >= 2) score += 8; // 3 of a kind in hand

  // 2. Check if card is adjacent in suit (potential Run)
  const sameSuitCards = hand.filter((c) => c.suit === card.suit && c.id !== card.id);
  for (const other of sameSuitCards) {
    const diff = Math.abs(card.rankIndex - other.rankIndex);
    if (diff === 1) score += 5; // Consecutive
    if (diff === 2) score += 2; // 1-gap run potential (e.g. 5 and 7)
  }

  // 3. Check if card can Sapaw onto any table meld
  for (const meld of exposedMelds) {
    if (canSapaw(card, meld)) {
      score += 7; // Can be laid off directly
    }
  }

  return score;
}

/**
 * Selects the optimal card to discard.
 * Evaluates deadwood penalty (higher value cards are worse to hold) vs. usefulness score.
 */
export function chooseBestDiscard(hand: Card[], exposedMelds: Meld[]): Card {
  if (hand.length === 1) return hand[0];

  let bestCard = hand[0];
  let bestScore = -Infinity; // We want to discard card with highest discard score

  for (const card of hand) {
    const usefulness = evaluateCardUsefulness(card, hand, exposedMelds);
    // Discard score = card value (prefer dumping 10s, Ks) - usefulness
    const discardScore = card.value * 1.5 - usefulness * 2;
    if (discardScore > bestScore) {
      bestScore = discardScore;
      bestCard = card;
    }
  }

  return bestCard;
}
