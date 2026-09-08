import { WebSocket } from 'ws';
import { Card } from '../src/game/engine/cards';
import { GameState, Player } from '../src/game/engine/gameState';
import {
  startNewGame,
  applyDrawStock,
  applyDrawDiscard,
  applyMeld,
  applySapaw,
  applyDiscard,
  applyCallDraw,
  applyDrawResponse,
  startNewRound,
  validateDrawStock,
  validateDrawDiscard,
  validateMeld,
  validateSapaw,
  validateDiscard,
  validateCallDraw,
} from '../src/game/engine/rules';
import { decideAIAction } from '../src/game/ai/aiPlayer';
import { ServerMessage } from './types';

export class GameSession {
  public id: string;
  public state: GameState;
  private sockets: Map<string, WebSocket> = new Map();
  private aiTimer: NodeJS.Timeout | null = null;
  private turnTimeoutTimer: NodeJS.Timeout | null = null;
  private onGameOver?: () => void;

  constructor(
    id: string,
    playerConfigs: Array<{
      id: string;
      name: string;
      avatar: string;
      type: 'HUMAN' | 'AI';
      aiDifficulty?: any;
      aiPersonality?: any;
    }>,
    options: { ante: number; tableName: string; isMultiplayer: boolean },
    onGameOver?: () => void
  ) {
    this.id = id;
    this.onGameOver = onGameOver;
    this.state = startNewGame(playerConfigs, {
      ante: options.ante,
      tableName: options.tableName,
      isMultiplayer: true,
    });
  }

  public registerSocket(playerId: string, ws: WebSocket) {
    this.sockets.set(playerId, ws);
    // Send immediate initial state
    this.sendToPlayer(playerId, {
      type: 'GAME_STARTED',
      payload: {
        gameState: this.getSanitizedState(playerId),
        myPlayerId: playerId,
      },
    });

    // Check if initial turn belongs to an AI bot
    this.checkNextTurn();
  }

  public removeSocket(playerId: string) {
    this.sockets.delete(playerId);
  }

  public destroy() {
    if (this.aiTimer) clearTimeout(this.aiTimer);
    if (this.turnTimeoutTimer) clearTimeout(this.turnTimeoutTimer);
    this.sockets.clear();
  }

  public handlePlayerAction(playerId: string, actionType: string, data: any): { success: boolean; error?: string } {
    if (this.state.phase === 'ROUND_END' || this.state.phase === 'GAME_OVER') {
      if (actionType === 'NEXT_ROUND') {
        const nextDealerId = this.state.roundResult?.winnerId || this.state.dealerId;
        this.state = startNewRound(this.state, nextDealerId);
        this.broadcastState();
        this.checkNextTurn();
        return { success: true };
      }
      return { success: false, error: 'Round has ended.' };
    }

    try {
      switch (actionType) {
        case 'DRAW_STOCK': {
          const val = validateDrawStock(this.state, playerId);
          if (!val.valid) return { success: false, error: val.error };
          this.state = applyDrawStock(this.state, playerId);
          break;
        }

        case 'DRAW_DISCARD': {
          const val = validateDrawDiscard(this.state, playerId);
          if (!val.valid) return { success: false, error: val.error };
          const meldCards = data?.meldCards;
          if (!meldCards || !Array.isArray(meldCards)) {
            return { success: false, error: 'Meld cards required to draw discard.' };
          }
          this.state = applyDrawDiscard(this.state, playerId, meldCards);
          break;
        }

        case 'MELD': {
          const cards: Card[] = data?.cards;
          if (!cards || !Array.isArray(cards)) return { success: false, error: 'Cards required.' };
          const val = validateMeld(this.state, playerId, cards);
          if (!val.valid) return { success: false, error: val.error };
          this.state = applyMeld(this.state, playerId, cards);
          break;
        }

        case 'SAPAW': {
          const card: Card = data?.card;
          const targetMeldId: string = data?.targetMeldId;
          if (!card || !targetMeldId) return { success: false, error: 'Card and target meld required.' };
          const val = validateSapaw(this.state, playerId, card, targetMeldId);
          if (!val.valid) return { success: false, error: val.error };
          this.state = applySapaw(this.state, playerId, card, targetMeldId);
          break;
        }

        case 'DISCARD': {
          const card: Card = data?.card;
          if (!card) return { success: false, error: 'Card to discard required.' };
          const val = validateDiscard(this.state, playerId, card);
          if (!val.valid) return { success: false, error: val.error };
          this.state = applyDiscard(this.state, playerId, card);
          break;
        }

        case 'CALL_DRAW': {
          const val = validateCallDraw(this.state, playerId);
          if (!val.valid) return { success: false, error: val.error };
          this.state = applyCallDraw(this.state, playerId);
          break;
        }

        case 'RESPOND_DRAW': {
          const response: 'FOLD' | 'CHALLENGE' = data?.response;
          if (!response) return { success: false, error: 'Response required.' };
          this.state = applyDrawResponse(this.state, playerId, response);
          break;
        }

        default:
          return { success: false, error: `Unknown action: ${actionType}` };
      }

      this.broadcastState();
      this.checkNextTurn();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Action failed' };
    }
  }

  public broadcastChat(senderId: string, message: string) {
    const sender = this.state.players.find((p) => p.id === senderId);
    const msg: ServerMessage = {
      type: 'CHAT_MESSAGE',
      payload: {
        senderId,
        senderName: sender?.name || 'Player',
        message,
        timestamp: Date.now(),
      },
    };
    const json = JSON.stringify(msg);
    this.sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(json);
      }
    });
  }

  public broadcastState() {
    this.sockets.forEach((ws, playerId) => {
      if (ws.readyState === WebSocket.OPEN) {
        const sanitized = this.getSanitizedState(playerId);
        const msg: ServerMessage = {
          type: 'GAME_STATE_UPDATE',
          payload: { gameState: sanitized },
        };
        ws.send(JSON.stringify(msg));
      }
    });
  }

  private sendToPlayer(playerId: string, msg: ServerMessage) {
    const ws = this.sockets.get(playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  /**
   * Masks opponents' hands so players cannot snoop hidden cards via DevTools network inspector.
   */
  public getSanitizedState(recipientPlayerId: string): GameState {
    const isRoundOver = this.state.phase === 'ROUND_END' || this.state.phase === 'GAME_OVER' || this.state.phase === 'SHOWDOWN';

    return {
      ...this.state,
      players: this.state.players.map((p) => {
        // Full hand revealed to owner or at end of round
        if (p.id === recipientPlayerId || isRoundOver) {
          return p;
        }
        // Mask opponent cards with dummy back cards preserving count
        return {
          ...p,
          hand: p.hand.map((_, idx): Card => ({
            id: `hidden-${p.id}-${idx}`,
            suit: 'spades',
            rank: 'A',
            value: 1,
            rankIndex: 1,
          })),
        };
      }),
    };
  }

  private checkNextTurn() {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
      this.aiTimer = null;
    }

    if (this.state.phase === 'ROUND_END' || this.state.phase === 'GAME_OVER') {
      return;
    }

    // 1. If in DRAW_CALLED, check if any AI opponent needs to respond
    if (this.state.phase === 'DRAW_CALLED' && this.state.drawCallState) {
      const pendingAiId = this.state.drawCallState.eligibleOpponents.find((id) => {
        const pl = this.state.players.find((p) => p.id === id);
        return pl?.type === 'AI' && this.state.drawCallState?.responses[id] === 'PENDING';
      });

      if (pendingAiId) {
        this.aiTimer = setTimeout(() => {
          const action = decideAIAction(this.state, pendingAiId);
          if (action && action.type === 'RESPOND_DRAW') {
            this.state = applyDrawResponse(this.state, pendingAiId, action.response);
            this.broadcastState();
            this.checkNextTurn();
          }
        }, 900);
        return;
      }
    }

    // 2. Regular AI Bot Turn
    const currentPlayer = this.state.players.find((p) => p.id === this.state.currentPlayerId);
    if (currentPlayer && currentPlayer.type === 'AI') {
      const delay = 800 + Math.random() * 600;
      this.aiTimer = setTimeout(() => {
        const action = decideAIAction(this.state, currentPlayer.id);
        if (!action) return;

        try {
          switch (action.type) {
            case 'CALL_DRAW':
              this.state = applyCallDraw(this.state, currentPlayer.id);
              break;
            case 'DRAW_STOCK':
              this.state = applyDrawStock(this.state, currentPlayer.id);
              break;
            case 'DRAW_DISCARD':
              this.state = applyDrawDiscard(this.state, currentPlayer.id, action.meldCards);
              break;
            case 'MELD':
              this.state = applyMeld(this.state, currentPlayer.id, action.cards);
              break;
            case 'SAPAW':
              this.state = applySapaw(this.state, currentPlayer.id, action.card, action.targetMeldId);
              break;
            case 'DISCARD':
              this.state = applyDiscard(this.state, currentPlayer.id, action.card);
              break;
          }
          this.broadcastState();
          this.checkNextTurn();
        } catch {
          // If action failed, fall back to safe discard if in AFTER_DRAW
          if (this.state.phase === 'AFTER_DRAW' && currentPlayer.hand.length > 0) {
            this.state = applyDiscard(this.state, currentPlayer.id, currentPlayer.hand[0]);
            this.broadcastState();
            this.checkNextTurn();
          }
        }
      }, delay);
    }
  }
}
