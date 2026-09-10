import { Card } from './cards';
import { GameState, Player } from './gameState';
import { calculateDeadwood } from './melds';
import { calculateRoundScores, RoundScoringResult, WinReason } from './scoring';

export interface ShowdownEvaluation {
  winnerId: string;
  winReason: WinReason;
  deadwoods: Record<string, number>;
  scoring: RoundScoringResult;
}

/**
 * Checks if a player has achieved Tongits (0 cards in hand).
 */
export function isTongits(player: Player): boolean {
  return player.hand.length === 0;
}

/**
 * Evaluates Draw call resolution after all eligible opponents have responded (FOLD or CHALLENGE).
 */
export function evaluateDrawCall(state: GameState): ShowdownEvaluation {
  if (!state.drawCallState) {
    throw new Error('No active draw call in state');
  }

  const callerId = state.drawCallState.callerId;
  const caller = state.players.find((p) => p.id === callerId)!;
  const challengers = state.drawCallState.eligibleOpponents.filter(
    (id) => state.drawCallState!.responses[id] === 'CHALLENGE'
  );

  const deadwoods: Record<string, number> = {};
  for (const p of state.players) {
    deadwoods[p.id] = calculateDeadwood(p.hand);
  }

  if (challengers.length === 0) {
    // All folded: caller wins without challenge
    const scoring = calculateRoundScores({
      winnerId: callerId,
      winReason: 'DRAW_NO_CHALLENGE',
      players: state.players,
      currentSidePot: state.sidePot,
    });

    return {
      winnerId: callerId,
      winReason: 'DRAW_NO_CHALLENGE',
      deadwoods,
      scoring,
    };
  }

  // At least one challenger: compare deadwood points
  // Rule: Challenger beats draw caller in a tie.
  // Rule: Between challengers, tie breaks in turn order counter-clockwise from caller.
  const callerDeadwood = deadwoods[callerId];
  let bestWinnerId = callerId;
  let lowestDeadwood = callerDeadwood;
  let isChallengerWin = false;

  const playerOrder = state.players.map((p) => p.id);
  const callerIdx = playerOrder.indexOf(callerId);
  // Sort challengers in turn order relative to caller
  const orderedChallengers = [...challengers].sort((a, b) => {
    const distA = (playerOrder.indexOf(a) - callerIdx + playerOrder.length) % playerOrder.length;
    const distB = (playerOrder.indexOf(b) - callerIdx + playerOrder.length) % playerOrder.length;
    return distA - distB;
  });

  for (const challengerId of orderedChallengers) {
    const challengerDeadwood = deadwoods[challengerId];
    // Challenger beats caller if challengerDeadwood <= callerDeadwood
    if (!isChallengerWin) {
      if (challengerDeadwood <= lowestDeadwood) {
        bestWinnerId = challengerId;
        lowestDeadwood = challengerDeadwood;
        isChallengerWin = true;
      }
    } else {
      // Challenger vs Challenger tie-break: lower deadwood wins strictly,
      // because we already iterated in turn order (first to tie wins).
      if (challengerDeadwood < lowestDeadwood) {
        bestWinnerId = challengerId;
        lowestDeadwood = challengerDeadwood;
      }
    }
  }

  const winReason: WinReason = 'DRAW_WON_CHALLENGE';
  const scoring = calculateRoundScores({
    winnerId: bestWinnerId,
    winReason,
    players: state.players,
    currentSidePot: state.sidePot,
  });

  return {
    winnerId: bestWinnerId,
    winReason,
    deadwoods,
    scoring,
  };
}

/**
 * Evaluates game when the stock runs out.
 * Unopened players are SUNOG (burned) and lose automatically.
 * Lowest deadwood among opened players wins.
 */
export function evaluateStockExhaustion(state: GameState): ShowdownEvaluation {
  const deadwoods: Record<string, number> = {};
  for (const p of state.players) {
    deadwoods[p.id] = calculateDeadwood(p.hand);
  }

  // Filter opened players
  const openedPlayers = state.players.filter((p) => p.opened);

  if (openedPlayers.length === 0) {
    // Rare edge case: no one opened, lowest deadwood wins
    const winner = [...state.players].sort((a, b) => deadwoods[a.id] - deadwoods[b.id])[0];
    const scoring = calculateRoundScores({
      winnerId: winner.id,
      winReason: 'STOCK_EXHAUSTED',
      players: state.players,
      currentSidePot: state.sidePot,
    });
    return {
      winnerId: winner.id,
      winReason: 'STOCK_EXHAUSTED',
      deadwoods,
      scoring,
    };
  }

  // Sort opened players by deadwood.
  // Tie-breaker: turn order starting from the player who just finished their turn (currentPlayerId).
  const currentIdx = state.players.findIndex((p) => p.id === state.currentPlayerId);
  const sortedOpened = [...openedPlayers].sort((a, b) => {
    const diff = deadwoods[a.id] - deadwoods[b.id];
    if (diff !== 0) return diff;
    const distA = (state.players.findIndex((p) => p.id === a.id) - currentIdx + 3) % 3;
    const distB = (state.players.findIndex((p) => p.id === b.id) - currentIdx + 3) % 3;
    return distA - distB;
  });

  const winner = sortedOpened[0];
  const scoring = calculateRoundScores({
    winnerId: winner.id,
    winReason: 'STOCK_EXHAUSTED',
    players: state.players,
    currentSidePot: state.sidePot,
  });

  return {
    winnerId: winner.id,
    winReason: 'STOCK_EXHAUSTED',
    deadwoods,
    scoring,
  };
}

/**
 * Evaluates an immediate Tongits win.
 */
export function evaluateTongits(state: GameState, winnerId: string): ShowdownEvaluation {
  const deadwoods: Record<string, number> = {};
  for (const p of state.players) {
    deadwoods[p.id] = calculateDeadwood(p.hand);
  }

  const scoring = calculateRoundScores({
    winnerId,
    winReason: 'TONGITS',
    players: state.players,
    currentSidePot: state.sidePot,
  });

  return {
    winnerId,
    winReason: 'TONGITS',
    deadwoods,
    scoring,
  };
}
