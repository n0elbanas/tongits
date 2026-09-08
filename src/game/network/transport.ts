import { GameState } from '../engine/gameState';

export interface GameTransportEvent {
  type: 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'ACTION' | 'CHAT' | 'STATE_SYNC' | 'ERROR';
  payload: any;
}

export interface GameTransport {
  connect(roomId: string, playerId: string): Promise<boolean>;
  disconnect(): void;
  sendAction(actionType: string, payload: any): void;
  subscribeToState(callback: (state: GameState) => void): () => void;
  sendChat(message: string): void;
  subscribeToEvents(callback: (event: GameTransportEvent) => void): () => void;
  isConnected(): boolean;
}

/**
 * Local deterministic in-memory transport implementation for single player / local games.
 * Acts as a drop-in replacement for WebSocket transport.
 */
export class LocalGameTransport implements GameTransport {
  private connected = false;
  private stateListeners: Array<(state: GameState) => void> = [];
  private eventListeners: Array<(event: GameTransportEvent) => void> = [];
  private currentState: GameState | null = null;

  async connect(_roomId: string, _playerId: string): Promise<boolean> {
    this.connected = true;
    return true;
  }

  disconnect(): void {
    this.connected = false;
    this.stateListeners = [];
    this.eventListeners = [];
  }

  sendAction(actionType: string, payload: any): void {
    this.emitEvent({
      type: 'ACTION',
      payload: { actionType, payload },
    });
  }

  subscribeToState(callback: (state: GameState) => void): () => void {
    this.stateListeners.push(callback);
    if (this.currentState) {
      callback(this.currentState);
    }
    return () => {
      this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
    };
  }

  sendChat(message: string): void {
    this.emitEvent({
      type: 'CHAT',
      payload: { message, timestamp: Date.now() },
    });
  }

  subscribeToEvents(callback: (event: GameTransportEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  updateState(state: GameState): void {
    this.currentState = state;
    this.stateListeners.forEach((cb) => cb(state));
  }

  private emitEvent(event: GameTransportEvent): void {
    this.eventListeners.forEach((cb) => cb(event));
  }
}

export interface MultiplayerRoom {
  id: string;
  name: string;
  host: string;
  hostAvatar: string;
  players: Array<{
    id: string;
    name: string;
    avatar: string;
    isReady: boolean;
    isHost?: boolean;
    chips: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    personality?: 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED';
  }>;
  maxPlayers: number;
  ante: number;
  ping: string;
  code: string;
  isPrivate: boolean;
  status: 'WAITING' | 'PLAYING';
  createdAt: number;
}

/**
 * Cross-tab Web BroadcastChannel Transport for seamless multi-tab multiplayer & synchronization.
 */
export class BroadcastGameTransport implements GameTransport {
  private channel: BroadcastChannel | null = null;
  private connected = false;
  private roomId: string = '';
  private playerId: string = '';
  private stateListeners: Array<(state: GameState) => void> = [];
  private eventListeners: Array<(event: GameTransportEvent) => void> = [];
  private currentState: GameState | null = null;

  async connect(roomId: string, playerId: string): Promise<boolean> {
    this.roomId = roomId;
    this.playerId = playerId;
    this.connected = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`tongits_room_${roomId}`);
      this.channel.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || msg.senderId === this.playerId) return;

        if (msg.type === 'ACTION' || msg.type === 'CHAT' || msg.type === 'PLAYER_JOINED' || msg.type === 'PLAYER_LEFT') {
          this.emitEvent({ type: msg.type, payload: msg.payload });
        } else if (msg.type === 'STATE_SYNC') {
          this.currentState = msg.payload;
          this.stateListeners.forEach((cb) => cb(msg.payload));
        }
      };

      // Broadcast join to other tabs
      this.channel.postMessage({
        type: 'PLAYER_JOINED',
        senderId: this.playerId,
        payload: { playerId: this.playerId, timestamp: Date.now() },
      });
    }

    return true;
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'PLAYER_LEFT',
        senderId: this.playerId,
        payload: { playerId: this.playerId },
      });
      this.channel.close();
      this.channel = null;
    }
    this.connected = false;
    this.stateListeners = [];
    this.eventListeners = [];
  }

  sendAction(actionType: string, payload: any): void {
    const event: GameTransportEvent = {
      type: 'ACTION',
      payload: { actionType, payload },
    };
    this.emitEvent(event);
    if (this.channel) {
      this.channel.postMessage({
        type: 'ACTION',
        senderId: this.playerId,
        payload: { actionType, payload },
      });
    }
  }

  subscribeToState(callback: (state: GameState) => void): () => void {
    this.stateListeners.push(callback);
    if (this.currentState) {
      callback(this.currentState);
    }
    return () => {
      this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
    };
  }

  sendChat(message: string): void {
    const payload = { message, timestamp: Date.now(), senderId: this.playerId };
    this.emitEvent({ type: 'CHAT', payload });
    if (this.channel) {
      this.channel.postMessage({
        type: 'CHAT',
        senderId: this.playerId,
        payload,
      });
    }
  }

  subscribeToEvents(callback: (event: GameTransportEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  updateState(state: GameState): void {
    this.currentState = state;
    this.stateListeners.forEach((cb) => cb(state));
    if (this.channel) {
      this.channel.postMessage({
        type: 'STATE_SYNC',
        senderId: this.playerId,
        payload: state,
      });
    }
  }

  private emitEvent(event: GameTransportEvent): void {
    this.eventListeners.forEach((cb) => cb(event));
  }
}

