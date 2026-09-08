import { GameState } from '../engine/gameState';

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  isBot: boolean;
  chips: number;
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  aiPersonality?: 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED';
}

export interface RoomState {
  id: string;
  code: string;
  name: string;
  ante: number;
  isPrivate: boolean;
  status: 'WAITING' | 'PLAYING';
  players: RoomPlayer[];
  createdAt: number;
  hostId: string;
}

export interface PublicRoomInfo {
  id: string;
  code: string;
  name: string;
  ante: number;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  hostAvatar: string;
  status: 'WAITING' | 'PLAYING';
}

// Client -> Server
export type ClientMessage =
  | { type: 'GET_ROOMS' }
  | {
      type: 'CREATE_ROOM';
      payload: {
        tableName: string;
        ante: number;
        isPrivate: boolean;
        playerName: string;
        playerAvatar: string;
      };
    }
  | {
      type: 'JOIN_ROOM';
      payload: {
        roomCode: string;
        playerName: string;
        playerAvatar: string;
      };
    }
  | { type: 'LEAVE_ROOM' }
  | { type: 'TOGGLE_READY'; payload?: { isReady?: boolean } }
  | { type: 'FILL_BOTS' }
  | { type: 'START_GAME' }
  | {
      type: 'GAME_ACTION';
      payload: {
        actionType:
          | 'DRAW_STOCK'
          | 'DRAW_DISCARD'
          | 'MELD'
          | 'SAPAW'
          | 'DISCARD'
          | 'CALL_DRAW'
          | 'RESPOND_DRAW'
          | 'NEXT_ROUND';
        data?: any;
      };
    }
  | { type: 'SEND_CHAT'; payload: { message: string } }
  | { type: 'PING' };

// Server -> Client
export type ServerMessage =
  | { type: 'ROOMS_LIST'; payload: { rooms: PublicRoomInfo[] } }
  | { type: 'ROOM_JOINED'; payload: { room: RoomState; myPlayerId: string } }
  | { type: 'ROOM_UPDATED'; payload: { room: RoomState } }
  | { type: 'GAME_STARTED'; payload: { gameState: GameState; myPlayerId: string } }
  | { type: 'GAME_STATE_UPDATE'; payload: { gameState: GameState } }
  | {
      type: 'ACTION_NOTIFICATION';
      payload: { text: string; type?: 'primary' | 'gold' | 'danger' | 'special' };
    }
  | {
      type: 'CHAT_MESSAGE';
      payload: { senderId: string; senderName: string; message: string; timestamp: number };
    }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'PONG' };
