import { Card } from './cards';
import { Meld } from './melds';
import { RoundScoringResult, WinReason } from './scoring';

export type PlayerType = 'HUMAN' | 'AI';
export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type AIPersonality = 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  type: PlayerType;
  aiDifficulty?: AIDifficulty;
  aiPersonality?: AIPersonality;
  hand: Card[];
  exposedMelds: Meld[];
  opened: boolean; // true once player has exposed at least one meld
  burned: boolean; // true if round ends without opening
  chips: number;
  winStreak: number;
  totalWins: number;
  totalLosses: number;
  // Draw call eligibility flags
  sapawedSinceLastTurn: boolean; // true if an opponent laid off on this player's melds
  sapawedSelfThisTurn: boolean; // true if player laid off on own meld during current turn
}

export type GamePhase =
  | 'WAITING'
  | 'DEALING'
  | 'PLAYER_TURN' // Turn start: can Call Draw (if eligible) or Draw from Stock/Discard
  | 'AFTER_DRAW' // Drawn: can Meld, Sapaw, Discard
  | 'DRAW_CALLED' // Draw challenged/folded overlay
  | 'SHOWDOWN'
  | 'ROUND_END' // Scoreboard display
  | 'GAME_OVER';

export interface DrawCallState {
  callerId: string;
  eligibleOpponents: string[]; // opened opponents who can fold or challenge
  responses: Record<string, 'FOLD' | 'CHALLENGE' | 'PENDING'>;
}

export interface GameActionLog {
  id: string;
  playerId: string;
  type: 'DRAW_STOCK' | 'DRAW_DISCARD' | 'MELD' | 'SAPAW' | 'DISCARD' | 'CALL_DRAW' | 'CHALLENGE' | 'FOLD' | 'TONGITS';
  timestamp: number;
  description: string;
  cards?: Card[];
  targetMeldId?: string;
}

export interface GameState {
  gameId: string;
  roundNumber: number;
  phase: GamePhase;
  players: Player[];
  dealerId: string;
  currentPlayerId: string;
  stock: Card[];
  discardPile: Card[];
  melds: Meld[]; // all exposed melds on table
  sidePot: number;
  ante?: number;
  tableName?: string;
  isMultiplayer?: boolean;
  drawCallState?: DrawCallState;
  lastAction?: GameActionLog;
  actionHistory: GameActionLog[];
  roundResult?: RoundScoringResult;
  isFirstTurnOfRound?: boolean;
}

export function getNextPlayerId(playerIds: string[], currentId: string): string {
  const idx = playerIds.indexOf(currentId);
  if (idx === -1) return playerIds[0];
  // Counter-clockwise turn order
  return playerIds[(idx + 1) % playerIds.length];
}

export function getPlayer(state: GameState, playerId: string): Player | undefined {
  return state.players.find((p) => p.id === playerId);
}
