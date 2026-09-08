import { GameState } from '../engine/gameState';
import { GameTransport, GameTransportEvent } from './transport';
import {
  ClientMessage,
  ServerMessage,
  RoomState,
  PublicRoomInfo,
} from './types';

export class WebSocketGameTransport implements GameTransport {
  private ws: WebSocket | null = null;
  private connected = false;
  private currentRoom: RoomState | null = null;
  private myPlayerId: string = '';
  private currentState: GameState | null = null;
  private pingInterval: any = null;

  // Listeners
  private stateListeners: Array<(state: GameState) => void> = [];
  private eventListeners: Array<(event: GameTransportEvent) => void> = [];
  private roomsListeners: Array<(rooms: PublicRoomInfo[]) => void> = [];
  private roomListeners: Array<(room: RoomState | null, myPlayerId: string) => void> = [];
  private gameStartListeners: Array<(gameState: GameState, myPlayerId: string) => void> = [];
  private chatListeners: Array<
    (chat: { senderId: string; senderName: string; message: string; timestamp: number }) => void
  > = [];
  private errorListeners: Array<(error: string) => void> = [];
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private notifListeners: Array<(notif: { text: string; type?: string }) => void> = [];

  constructor() {
    // Auto-connect if in browser environment
    if (typeof window !== 'undefined') {
      this.initConnection();
    }
  }

  public initConnection(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(this.connected);
    }

    return new Promise((resolve) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Connect to relative /ws on the same host (works seamlessly with Vite proxy & Caddy reverse_proxy)
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.connected = true;
          this.notifyConnection(true);
          this.startPing();
          resolve(true);
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.notifyConnection(false);
          this.stopPing();
          // Attempt reconnect after 3 seconds
          setTimeout(() => {
            if (!this.connected) {
              this.initConnection().catch(() => {});
            }
          }, 3000);
        };

        this.ws.onerror = () => {
          this.connected = false;
          this.notifyConnection(false);
          resolve(false);
        };

        this.ws.onmessage = (event) => {
          try {
            const msg: ServerMessage = JSON.parse(event.data);
            this.handleServerMessage(msg);
          } catch {
            // Ignore malformed payloads
          }
        };
      } catch (e) {
        this.connected = false;
        this.notifyConnection(false);
        resolve(false);
      }
    });
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'ROOMS_LIST':
        this.roomsListeners.forEach((cb) => cb(msg.payload.rooms));
        break;

      case 'ROOM_JOINED':
        this.currentRoom = msg.payload.room;
        this.myPlayerId = msg.payload.myPlayerId;
        this.roomListeners.forEach((cb) => cb(this.currentRoom, this.myPlayerId));
        this.emitEvent({
          type: 'PLAYER_JOINED',
          payload: { room: this.currentRoom, myPlayerId: this.myPlayerId },
        });
        break;

      case 'ROOM_UPDATED':
        this.currentRoom = msg.payload.room;
        this.roomListeners.forEach((cb) => cb(this.currentRoom, this.myPlayerId));
        break;

      case 'GAME_STARTED':
        this.currentState = msg.payload.gameState;
        this.myPlayerId = msg.payload.myPlayerId;
        this.gameStartListeners.forEach((cb) => cb(msg.payload.gameState, msg.payload.myPlayerId));
        this.stateListeners.forEach((cb) => cb(msg.payload.gameState));
        break;

      case 'GAME_STATE_UPDATE':
        this.currentState = msg.payload.gameState;
        this.stateListeners.forEach((cb) => cb(msg.payload.gameState));
        break;

      case 'ACTION_NOTIFICATION':
        this.notifListeners.forEach((cb) => cb(msg.payload));
        break;

      case 'CHAT_MESSAGE':
        this.chatListeners.forEach((cb) => cb(msg.payload));
        this.emitEvent({ type: 'CHAT', payload: msg.payload });
        break;

      case 'ERROR':
        this.errorListeners.forEach((cb) => cb(msg.payload.message));
        this.emitEvent({ type: 'ERROR', payload: msg.payload.message });
        break;

      case 'PONG':
        // Heartbeat received
        break;
    }
  }

  private send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      // If not connected, try connecting then sending
      this.initConnection().then((ok) => {
        if (ok && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(msg));
        }
      });
    }
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: 'PING' });
    }, 15000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private notifyConnection(connected: boolean) {
    this.connectionListeners.forEach((cb) => cb(connected));
  }

  // --- GameTransport Interface ---

  async connect(_roomId: string, _playerId: string): Promise<boolean> {
    return this.initConnection();
  }

  disconnect(): void {
    this.leaveRoom();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.notifyConnection(false);
  }

  sendAction(actionType: any, payload: any): void {
    this.send({
      type: 'GAME_ACTION',
      payload: {
        actionType,
        data: payload,
      },
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
    this.send({
      type: 'SEND_CHAT',
      payload: { message },
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

  private emitEvent(event: GameTransportEvent) {
    this.eventListeners.forEach((cb) => cb(event));
  }

  // --- Room Management Methods ---

  public getRooms(): void {
    this.send({ type: 'GET_ROOMS' });
  }

  public createRoom(params: {
    tableName: string;
    ante: number;
    isPrivate: boolean;
    playerName: string;
    playerAvatar: string;
  }): void {
    this.send({
      type: 'CREATE_ROOM',
      payload: params,
    });
  }

  public joinRoom(params: {
    roomCode: string;
    playerName: string;
    playerAvatar: string;
  }): void {
    this.send({
      type: 'JOIN_ROOM',
      payload: params,
    });
  }

  public leaveRoom(): void {
    this.send({ type: 'LEAVE_ROOM' });
    this.currentRoom = null;
    this.roomListeners.forEach((cb) => cb(null, this.myPlayerId));
  }

  public fillBots(): void {
    this.send({ type: 'FILL_BOTS' });
  }

  public toggleReady(isReady?: boolean): void {
    this.send({
      type: 'TOGGLE_READY',
      payload: { isReady },
    });
  }

  public startGame(): void {
    this.send({ type: 'START_GAME' });
  }

  // --- Subscriptions ---

  public subscribeToRooms(callback: (rooms: PublicRoomInfo[]) => void): () => void {
    this.roomsListeners.push(callback);
    this.getRooms();
    return () => {
      this.roomsListeners = this.roomsListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToRoom(callback: (room: RoomState | null, myPlayerId: string) => void): () => void {
    this.roomListeners.push(callback);
    if (this.currentRoom) {
      callback(this.currentRoom, this.myPlayerId);
    }
    return () => {
      this.roomListeners = this.roomListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToGameStart(callback: (gameState: GameState, myPlayerId: string) => void): () => void {
    this.gameStartListeners.push(callback);
    return () => {
      this.gameStartListeners = this.gameStartListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToChat(
    callback: (chat: { senderId: string; senderName: string; message: string; timestamp: number }) => void
  ): () => void {
    this.chatListeners.push(callback);
    return () => {
      this.chatListeners = this.chatListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToErrors(callback: (error: string) => void): () => void {
    this.errorListeners.push(callback);
    return () => {
      this.errorListeners = this.errorListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToConnection(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    callback(this.connected);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeToNotifications(callback: (notif: { text: string; type?: string }) => void): () => void {
    this.notifListeners.push(callback);
    return () => {
      this.notifListeners = this.notifListeners.filter((cb) => cb !== callback);
    };
  }

  public getCurrentRoom(): RoomState | null {
    return this.currentRoom;
  }

  public getMyPlayerId(): string {
    return this.myPlayerId;
  }
}

// Global shared singleton for the client
export const wsTransport = new WebSocketGameTransport();
