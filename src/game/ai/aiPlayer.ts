import { Card } from '../engine/cards';
import { GameState, Player } from '../engine/gameState';
import {
  validateCallDraw,
  validateDrawDiscard,
  validateDrawStock,
  validateMeld,
  validateSapaw,
  applyCallDraw,
  applyDrawDiscard,
  applyDrawStock,
  applyMeld,
  applySapaw,
  applyDiscard,
  applyDrawResponse,
} from '../engine/rules';
import { findPossibleMelds, canSapaw, calculateDeadwood } from '../engine/melds';
import { BOT_PRESETS, BotProfile } from './personalities';
import { chooseBestDiscard } from './evaluation';

export type AIAction =
  | { type: 'CALL_DRAW' }
  | { type: 'DRAW_STOCK' }
  | { type: 'DRAW_DISCARD'; meldCards: Card[] }
  | { type: 'MELD'; cards: Card[] }
  | { type: 'SAPAW'; card: Card; targetMeldId: string }
  | { type: 'DISCARD'; card: Card }
  | { type: 'RESPOND_DRAW'; response: 'FOLD' | 'CHALLENGE' };

export function getBotProfile(player: Player): BotProfile {
  const match = BOT_PRESETS.find((p) => p.id === player.id || p.name === player.name);
  if (match) return match;
  return BOT_PRESETS[0]; // fallback
}

/**
 * Determines the next action for an AI bot player.
 */
export function decideAIAction(state: GameState, botPlayerId: string): AIAction | null {
  const bot = state.players.find((p) => p.id === botPlayerId);
  if (!bot || bot.type !== 'HUMAN' && bot.type !== 'AI') return null;

  const profile = getBotProfile(bot);

  // 1. If currently in DRAW_CALLED phase and bot is eligible to respond
  if (state.phase === 'DRAW_CALLED' && state.drawCallState) {
    if (
      state.drawCallState.eligibleOpponents.includes(botPlayerId) &&
      state.drawCallState.responses[botPlayerId] === 'PENDING'
    ) {
      const deadwood = calculateDeadwood(bot.hand);
      // If deadwood is within threshold, challenge!
      const shouldChallenge = deadwood <= profile.challengeDeadwoodThreshold;
      return {
        type: 'RESPOND_DRAW',
        response: shouldChallenge ? 'CHALLENGE' : 'FOLD',
      };
    }
    return null;
  }

  // Ensure it's bot's turn
  if (state.currentPlayerId !== botPlayerId) return null;

  // 2. PHASE: PLAYER_TURN (before drawing)
  if (state.phase === 'PLAYER_TURN') {
    // Check if Draw call is legal and strategic
    const drawCheck = validateCallDraw(state, botPlayerId);
    if (drawCheck.valid) {
      const deadwood = calculateDeadwood(bot.hand);
      if (deadwood <= profile.drawCallDeadwoodThreshold) {
        return { type: 'CALL_DRAW' };
      }
    }

    // Check if drawing from discard is legal and forms a meld
    const discardCheck = validateDrawDiscard(state, botPlayerId);
    if (discardCheck.valid && discardCheck.possibleMelds && discardCheck.possibleMelds.length > 0) {
      // Pick best meld (e.g. highest card count or largest deadwood reduction)
      const chosenMeld = discardCheck.possibleMelds[0];
      return {
        type: 'DRAW_DISCARD',
        meldCards: chosenMeld,
      };
    }

    // Otherwise draw from stock
    const stockCheck = validateDrawStock(state, botPlayerId);
    if (stockCheck.valid) {
      return { type: 'DRAW_STOCK' };
    }
  }

  // 3. PHASE: AFTER_DRAW (can meld, sapaw, then discard)
  if (state.phase === 'AFTER_DRAW') {
    // Check for possible melds in hand
    const possibleMelds = findPossibleMelds(bot.hand);
    if (possibleMelds.length > 0) {
      // Decide whether to meld based on aggressiveness
      // Always meld if unopened or if hand has enough cards
      const shouldMeld = !bot.opened || Math.random() < profile.openMeldAggressiveness;
      if (shouldMeld) {
        // Meld the longest or highest value meld
        const sortedMelds = [...possibleMelds].sort(
          (a, b) => b.length - a.length || calculateDeadwood(b) - calculateDeadwood(a)
        );
        const meldCandidate = sortedMelds[0];
        // Ensure hand will still have at least 1 card left to discard or reaches 0 (Tongits)
        if (bot.hand.length - meldCandidate.length >= 0) {
          const meldCheck = validateMeld(state, botPlayerId, meldCandidate);
          if (meldCheck.valid) {
            return { type: 'MELD', cards: meldCandidate };
          }
        }
      }
    }

    // Check for possible Sapaw lay-offs
    for (const card of bot.hand) {
      for (const meld of state.melds) {
        if (canSapaw(card, meld)) {
          const sapawCheck = validateSapaw(state, botPlayerId, card, meld.id);
          if (sapawCheck.valid) {
            return { type: 'SAPAW', card, targetMeldId: meld.id };
          }
        }
      }
    }

    // If no more melds or sapaws to play, discard 1 card!
    if (bot.hand.length > 0) {
      const discardCard = chooseBestDiscard(bot.hand, state.melds);
      return { type: 'DISCARD', card: discardCard };
    }
  }

  return null;
}
