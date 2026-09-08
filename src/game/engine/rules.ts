import { Card } from './cards';
import { Meld, isValidMeld, canSapaw, findMeldsWithTargetCard, MeldType } from './melds';
import { GameState, Player, getNextPlayerId, DrawCallState, GameActionLog } from './gameState';
import { evaluateDrawCall, evaluateStockExhaustion, evaluateTongits } from './winConditions';
import { dealCards, shuffleDeck } from './deck';
import { createDeck } from './cards';

export interface ActionValidation {
  valid: boolean;
  error?: string;
  type?: MeldType;
  possibleMelds?: Card[][];
}

/**
 * Checks if a player can call Draw at the beginning of their turn.
 */
export function validateCallDraw(state: GameState, playerId: string): ActionValidation {
  if (state.phase !== 'PLAYER_TURN') {
    return { valid: false, error: 'Draw can only be called at the start of your turn before drawing.' };
  }
  if (state.currentPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found.' };
  }

  if (!player.opened) {
    return { valid: false, error: 'You must open at least one meld before calling Draw.' };
  }

  if (player.sapawedSinceLastTurn) {
    return { valid: false, error: 'Cannot call Draw: another player laid off (Sapaw) on your meld since your last turn.' };
  }

  if (player.sapawedSelfThisTurn) {
    return { valid: false, error: 'Cannot call Draw: you laid off cards on your meld.' };
  }

  return { valid: true };
}

/**
 * Checks if a player can draw from the stock pile.
 */
export function validateDrawStock(state: GameState, playerId: string): ActionValidation {
  if (state.phase !== 'PLAYER_TURN') {
    return { valid: false, error: 'Cannot draw from stock in current phase.' };
  }
  if (state.currentPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn.' };
  }
  if (state.stock.length === 0) {
    return { valid: false, error: 'Stock pile is empty.' };
  }
  return { valid: true };
}

/**
 * Checks if a player can take the top card from the discard pile.
 * Restriction: MUST immediately form a valid new exposed meld with cards in hand.
 */
export function validateDrawDiscard(state: GameState, playerId: string): ActionValidation {
  if (state.phase !== 'PLAYER_TURN') {
    return { valid: false, error: 'Cannot take discard in current phase.' };
  }
  if (state.currentPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn.' };
  }
  if (state.discardPile.length === 0) {
    return { valid: false, error: 'Discard pile is empty.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, error: 'Player not found.' };

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const possibleMelds = findMeldsWithTargetCard(player.hand, topDiscard);

  if (possibleMelds.length === 0) {
    return {
      valid: false,
      error: `Cannot take ${topDiscard.rank} of ${topDiscard.suit}: it does not form a valid new meld with your hand cards.`,
      possibleMelds: [],
    };
  }

  return { valid: true, possibleMelds };
}

/**
 * Validates a Meld action with cards from hand.
 */
export function validateMeld(state: GameState, playerId: string, cards: Card[]): ActionValidation {
  if (state.phase !== 'AFTER_DRAW') {
    return { valid: false, error: 'You must draw a card before melding.' };
  }
  if (state.currentPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, error: 'Player not found.' };

  const handCardIds = new Set(player.hand.map((c) => c.id));
  const allInHand = cards.every((c) => handCardIds.has(c.id));
  if (!allInHand) {
    return { valid: false, error: 'Selected cards are not all in your hand.' };
  }

  const check = isValidMeld(cards);
  if (!check.valid) {
    return { valid: false, error: 'Selected cards do not form a valid Set or Run (Ace is low, 3+ cards required).' };
  }

  return { valid: true, type: check.type };
}

/**
 * Validates a Sapaw (lay-off) action of a card onto an existing table meld.
 */
export function validateSapaw(
  state: GameState,
  playerId: string,
  card: Card,
  targetMeldId: string
): ActionValidation {
  if (state.phase !== 'AFTER_DRAW') {
    return { valid: false, error: 'You must draw before laying off (Sapaw).' };
  }
  if (state.currentPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, error: 'Player not found.' };

  if (!player.hand.some((c) => c.id === card.id)) {
    return { valid: false, error: 'Card is not in your hand.' };
  }

  const meld = state.melds.find((m) => m.id === targetMeldId);
  if (!meld) {
    return { valid: false, error: 'Target meld not found on table.' };
  }

  if (!canSapaw(card, meld)) {
    return { valid: false, error: 'Card cannot be legally added to this meld.' };
  }

  return { valid: true };
}

/**
 * Validates a Discard action.
 */
export function validateDiscard(state: GameState, playerId: string, card: Card): ActionValidation {
  if (state.phase !== 'AFTER_DRAW') {
    return { valid: false, error: 'You must draw before discarding.' };
  }
  if (state.currentPlayerId !== playerId) {
    return { valid: false, error: 'Not your turn.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, error: 'Player not found.' };

  if (!player.hand.some((c) => c.id === card.id)) {
    return { valid: false, error: 'Card is not in your hand.' };
  }

  return { valid: true };
}

// -------------------------------------------------------------
// STATE TRANSITION ENGINE
// -------------------------------------------------------------

export function startNewGame(
  playerConfigs: Array<{ id: string; name: string; avatar: string; type: 'HUMAN' | 'AI'; aiDifficulty?: any; aiPersonality?: any }>,
  options?: { ante?: number; tableName?: string; isMultiplayer?: boolean }
): GameState {
  const initialPlayers: Player[] = playerConfigs.map((cfg) => ({
    ...cfg,
    hand: [],
    exposedMelds: [],
    opened: false,
    burned: false,
    chips: 100, // starting bankroll
    winStreak: 0,
    totalWins: 0,
    totalLosses: 0,
    sapawedSinceLastTurn: false,
    sapawedSelfThisTurn: false,
  }));

  // Choose initial dealer randomly
  const dealerIdx = Math.floor(Math.random() * initialPlayers.length);
  const dealerId = initialPlayers[dealerIdx].id;

  return startNewRound({
    gameId: `game-${Date.now()}`,
    roundNumber: 1,
    phase: 'DEALING',
    players: initialPlayers,
    dealerId,
    currentPlayerId: dealerId,
    stock: [],
    discardPile: [],
    melds: [],
    sidePot: 0,
    ante: options?.ante ?? 2,
    tableName: options?.tableName,
    isMultiplayer: options?.isMultiplayer,
    actionHistory: [],
  }, dealerId);
}

export function startNewRound(currentState: GameState, nextDealerId: string): GameState {
  const deck = shuffleDeck(createDeck());
  const playerIds = currentState.players.map((p) => p.id);
  const dealResult = dealCards(deck, nextDealerId, playerIds);

  const antePerPlayer = currentState.ante ?? 2;
  const updatedPlayers = currentState.players.map((p) => ({
    ...p,
    hand: dealResult.hands[p.id],
    exposedMelds: [],
    opened: false,
    burned: false,
    chips: Math.max(0, p.chips - antePerPlayer),
    sapawedSinceLastTurn: false,
    sapawedSelfThisTurn: false,
  }));

  const accumulatedSidePot = currentState.sidePot + antePerPlayer * updatedPlayers.length;

  const initialAction: GameActionLog = {
    id: `act-${Date.now()}`,
    playerId: nextDealerId,
    type: 'DRAW_STOCK',
    timestamp: Date.now(),
    description: `Round ${currentState.roundNumber} started. ${nextDealerId} is dealer and begins with 13 cards.`,
  };

  return {
    ...currentState,
    phase: 'AFTER_DRAW', // Dealer starts with 13 cards, so already has drawn!
    players: updatedPlayers,
    dealerId: nextDealerId,
    currentPlayerId: nextDealerId,
    stock: dealResult.stock,
    discardPile: [],
    melds: [],
    sidePot: accumulatedSidePot,
    drawCallState: undefined,
    roundResult: undefined,
    lastAction: initialAction,
    actionHistory: [initialAction],
    isFirstTurnOfRound: true,
  };
}

export function applyDrawStock(state: GameState, playerId: string): GameState {
  const validation = validateDrawStock(state, playerId);
  if (!validation.valid) throw new Error(validation.error);

  const stockCopy = [...state.stock];
  const drawnCard = stockCopy.shift()!;

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    return {
      ...p,
      hand: [...p.hand, drawnCard],
    };
  });

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId,
    type: 'DRAW_STOCK',
    timestamp: Date.now(),
    description: `${getPlayer(state, playerId)?.name} drew a card from stock.`,
  };

  return {
    ...state,
    phase: 'AFTER_DRAW',
    stock: stockCopy,
    players: updatedPlayers,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
  };
}

export function applyDrawDiscard(
  state: GameState,
  playerId: string,
  meldWithCards: Card[] // Cards from hand + top discard card
): GameState {
  const validation = validateDrawDiscard(state, playerId);
  if (!validation.valid) throw new Error(validation.error);

  const discardCopy = [...state.discardPile];
  const topDiscard = discardCopy.pop()!;

  // Check if meldWithCards is valid and contains topDiscard
  if (!meldWithCards.some((c) => c.id === topDiscard.id)) {
    throw new Error('Meld must include the picked discard card');
  }
  const check = isValidMeld(meldWithCards);
  if (!check.valid) {
    throw new Error('Selected combination is not a valid Set or Run');
  }

  const handCardIdsToUse = new Set(
    meldWithCards.filter((c) => c.id !== topDiscard.id).map((c) => c.id)
  );

  const newMeld: Meld = {
    id: `meld-${Date.now()}-${Math.random()}`,
    type: check.type!,
    cards: meldWithCards,
    ownerId: playerId,
  };

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    return {
      ...p,
      hand: p.hand.filter((c) => !handCardIdsToUse.has(c.id)),
      exposedMelds: [...p.exposedMelds, newMeld],
      opened: true,
    };
  });

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId,
    type: 'DRAW_DISCARD',
    timestamp: Date.now(),
    description: `${getPlayer(state, playerId)?.name} picked ${topDiscard.rank} of ${topDiscard.suit} and melded a ${check.type}.`,
    cards: meldWithCards,
  };

  const nextState: GameState = {
    ...state,
    phase: 'AFTER_DRAW',
    discardPile: discardCopy,
    melds: [...state.melds, newMeld],
    players: updatedPlayers,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
  };

  // If hand has 0 cards, Tongits!
  const curPlayer = updatedPlayers.find((p) => p.id === playerId)!;
  if (curPlayer.hand.length === 0) {
    return triggerTongitsWin(nextState, playerId);
  }

  return nextState;
}

export function applyMeld(state: GameState, playerId: string, cards: Card[]): GameState {
  const validation = validateMeld(state, playerId, cards);
  if (!validation.valid) throw new Error(validation.error);

  const cardIdsToMeld = new Set(cards.map((c) => c.id));
  const newMeld: Meld = {
    id: `meld-${Date.now()}-${Math.random()}`,
    type: validation.type!,
    cards: cards,
    ownerId: playerId,
  };

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    return {
      ...p,
      hand: p.hand.filter((c) => !cardIdsToMeld.has(c.id)),
      exposedMelds: [...p.exposedMelds, newMeld],
      opened: true,
    };
  });

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId,
    type: 'MELD',
    timestamp: Date.now(),
    description: `${getPlayer(state, playerId)?.name} melded a ${validation.type}.`,
    cards,
  };

  const nextState: GameState = {
    ...state,
    melds: [...state.melds, newMeld],
    players: updatedPlayers,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
  };

  const curPlayer = updatedPlayers.find((p) => p.id === playerId)!;
  if (curPlayer.hand.length === 0) {
    return triggerTongitsWin(nextState, playerId);
  }

  return nextState;
}

export function applySapaw(
  state: GameState,
  playerId: string,
  card: Card,
  targetMeldId: string
): GameState {
  const validation = validateSapaw(state, playerId, card, targetMeldId);
  if (!validation.valid) throw new Error(validation.error);

  const targetMeld = state.melds.find((m) => m.id === targetMeldId)!;
  const updatedMeldCards = [...targetMeld.cards, card];
  if (targetMeld.type === 'run') {
    updatedMeldCards.sort((a, b) => a.rankIndex - b.rankIndex);
  }

  const updatedMelds = state.melds.map((m) => {
    if (m.id !== targetMeldId) return m;
    return {
      ...m,
      cards: updatedMeldCards,
    };
  });

  // Track Sapaw flags
  const isSapawOnSelf = targetMeld.ownerId === playerId;

  const updatedPlayers = state.players.map((p) => {
    let pCopy = { ...p };
    if (p.id === playerId) {
      pCopy.hand = pCopy.hand.filter((c) => c.id !== card.id);
      if (isSapawOnSelf) {
        pCopy.sapawedSelfThisTurn = true;
      }
    }
    if (!isSapawOnSelf && p.id === targetMeld.ownerId) {
      // Opponent meld owner is locked from calling Draw on their next turn!
      pCopy.sapawedSinceLastTurn = true;
    }
    return pCopy;
  });

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId,
    type: 'SAPAW',
    timestamp: Date.now(),
    description: `${getPlayer(state, playerId)?.name} laid off (Sapaw) ${card.rank} of ${card.suit} onto ${getPlayer(state, targetMeld.ownerId)?.name}'s meld.`,
    cards: [card],
    targetMeldId,
  };

  const nextState: GameState = {
    ...state,
    melds: updatedMelds,
    players: updatedPlayers,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
  };

  const curPlayer = updatedPlayers.find((p) => p.id === playerId)!;
  if (curPlayer.hand.length === 0) {
    return triggerTongitsWin(nextState, playerId);
  }

  return nextState;
}

export function applyDiscard(state: GameState, playerId: string, card: Card): GameState {
  const validation = validateDiscard(state, playerId, card);
  if (!validation.valid) throw new Error(validation.error);

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    return {
      ...p,
      hand: p.hand.filter((c) => c.id !== card.id),
    };
  });

  const updatedDiscard = [...state.discardPile, card];

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId,
    type: 'DISCARD',
    timestamp: Date.now(),
    description: `${getPlayer(state, playerId)?.name} discarded ${card.rank} of ${card.suit}.`,
    cards: [card],
  };

  const curPlayer = updatedPlayers.find((p) => p.id === playerId)!;
  if (curPlayer.hand.length === 0) {
    return triggerTongitsWin(
      {
        ...state,
        discardPile: updatedDiscard,
        players: updatedPlayers,
      },
      playerId
    );
  }

  // Check if stock is now exhausted
  if (state.stock.length === 0) {
    return triggerStockExhaustion({
      ...state,
      discardPile: updatedDiscard,
      players: updatedPlayers,
      lastAction: log,
      actionHistory: [...state.actionHistory, log],
    });
  }

  // Advance turn to next player
  const playerIds = state.players.map((p) => p.id);
  const nextPlayerId = getNextPlayerId(playerIds, playerId);

  // Reset next player's per-turn transient flags
  const finalizedPlayers = updatedPlayers.map((p) => {
    if (p.id === nextPlayerId) {
      return {
        ...p,
        sapawedSelfThisTurn: false,
      };
    }
    return p;
  });

  return {
    ...state,
    phase: 'PLAYER_TURN',
    currentPlayerId: nextPlayerId,
    discardPile: updatedDiscard,
    players: finalizedPlayers,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
    isFirstTurnOfRound: false,
  };
}

export function applyCallDraw(state: GameState, callerId: string): GameState {
  const validation = validateCallDraw(state, callerId);
  if (!validation.valid) throw new Error(validation.error);

  // Eligible opponents are all opponents who have opened at least one meld
  const eligibleOpponents = state.players
    .filter((p) => p.id !== callerId && p.opened)
    .map((p) => p.id);

  const initialResponses: Record<string, 'FOLD' | 'CHALLENGE' | 'PENDING'> = {};
  for (const oppId of eligibleOpponents) {
    initialResponses[oppId] = 'PENDING';
  }

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId: callerId,
    type: 'CALL_DRAW',
    timestamp: Date.now(),
    description: `${getPlayer(state, callerId)?.name} called DRAW!`,
  };

  const drawCallState: DrawCallState = {
    callerId,
    eligibleOpponents,
    responses: initialResponses,
  };

  // If no opponents have opened, caller wins immediately
  if (eligibleOpponents.length === 0) {
    return resolveDrawShowdown({
      ...state,
      phase: 'DRAW_CALLED',
      drawCallState,
      lastAction: log,
      actionHistory: [...state.actionHistory, log],
    });
  }

  return {
    ...state,
    phase: 'DRAW_CALLED',
    drawCallState,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
  };
}

export function applyDrawResponse(
  state: GameState,
  opponentId: string,
  response: 'FOLD' | 'CHALLENGE'
): GameState {
  if (state.phase !== 'DRAW_CALLED' || !state.drawCallState) {
    throw new Error('No active Draw call to respond to');
  }

  const { drawCallState } = state;
  if (!drawCallState.eligibleOpponents.includes(opponentId)) {
    throw new Error('Player is not eligible to respond to Draw call');
  }

  const updatedResponses = {
    ...drawCallState.responses,
    [opponentId]: response,
  };

  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId: opponentId,
    type: response === 'CHALLENGE' ? 'CHALLENGE' : 'FOLD',
    timestamp: Date.now(),
    description: `${getPlayer(state, opponentId)?.name} chose to ${response} the Draw call.`,
  };

  const nextDrawState: DrawCallState = {
    ...drawCallState,
    responses: updatedResponses,
  };

  const updatedState: GameState = {
    ...state,
    drawCallState: nextDrawState,
    lastAction: log,
    actionHistory: [...state.actionHistory, log],
  };

  // If all eligible opponents responded, resolve showdown
  const allAnswered = nextDrawState.eligibleOpponents.every(
    (id) => updatedResponses[id] !== 'PENDING'
  );

  if (allAnswered) {
    return resolveDrawShowdown(updatedState);
  }

  return updatedState;
}

function resolveDrawShowdown(state: GameState): GameState {
  const result = evaluateDrawCall(state);
  return finalizeRound(state, result.scoring);
}

function triggerTongitsWin(state: GameState, winnerId: string): GameState {
  const result = evaluateTongits(state, winnerId);
  const log: GameActionLog = {
    id: `act-${Date.now()}-${Math.random()}`,
    playerId: winnerId,
    type: 'TONGITS',
    timestamp: Date.now(),
    description: `${getPlayer(state, winnerId)?.name} scored TONG-ITS!`,
  };
  return finalizeRound(
    {
      ...state,
      lastAction: log,
      actionHistory: [...state.actionHistory, log],
    },
    result.scoring
  );
}

function triggerStockExhaustion(state: GameState): GameState {
  const result = evaluateStockExhaustion(state);
  return finalizeRound(state, result.scoring);
}

function finalizeRound(state: GameState, scoring: import('./scoring').RoundScoringResult): GameState {
  const updatedPlayers = state.players.map((p) => {
    const breakdown = scoring.playerBreakdowns[p.id];
    const isWinner = p.id === scoring.winnerId;
    return {
      ...p,
      chips: Math.max(0, p.chips + (breakdown ? breakdown.chipDelta : 0)),
      winStreak: isWinner ? p.winStreak + 1 : 0,
      totalWins: isWinner ? p.totalWins + 1 : p.totalWins,
      totalLosses: !isWinner ? p.totalLosses + 1 : p.totalLosses,
      burned: breakdown ? breakdown.isSunog : false,
      sapawedSinceLastTurn: false,
      sapawedSelfThisTurn: false,
    };
  });

  return {
    ...state,
    phase: 'ROUND_END',
    players: updatedPlayers,
    sidePot: scoring.newSidePot,
    roundResult: scoring,
  };
}

function getPlayer(state: GameState, id: string) {
  return state.players.find((p) => p.id === id);
}
