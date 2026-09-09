import { WebSocket } from 'ws';
import { GameSession } from './gameSession';
import { RoomState, RoomPlayer, PublicRoomInfo, ServerMessage } from './types';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude confusing chars I, O, 1, 0
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BOT_NAMES = ['Cardo Bot', 'Marites Bot', 'Boyong Bot', 'Inday Bot', 'Nonoy Bot'];
const BOT_AVATARS = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5'];

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map(); // roomId -> RoomState
  private roomByCode: Map<string, string> = new Map(); // code -> roomId
  private sessions: Map<string, GameSession> = new Map(); // roomId -> GameSession
  private wsMap: Map<WebSocket, { roomId: string; playerId: string }> = new Map();
  private playerSockets: Map<string, WebSocket> = new Map(); // playerId -> WebSocket
  private connectedClients: Set<WebSocket> = new Set(); // all active sockets in lobby

  constructor() {
    this.seedDefaultRooms();
  }

  public registerClient(ws: WebSocket) {
    this.connectedClients.add(ws);
  }

  public unregisterClient(ws: WebSocket) {
    this.connectedClients.delete(ws);
    this.handleDisconnect(ws);
  }

  private seedDefaultRooms() {
    const defaultTables = [
      {
        id: 'room_mnl99',
        code: 'MNL99',
        name: 'Manila Masters (High Stakes)',
        ante: 10,
        hostName: 'Rafael Bot',
        hostAvatar: 'avatar_3',
      },
      {
        id: 'room_ceb14',
        code: 'CEB14',
        name: 'Cebu Casuals Table',
        ante: 2,
        hostName: 'Liza Bot',
        hostAvatar: 'avatar_4',
      },
      {
        id: 'room_bag88',
        code: 'BAG88',
        name: 'Baguio Pro League',
        ante: 5,
        hostName: 'Marco Bot',
        hostAvatar: 'avatar_5',
      },
    ];

    for (const t of defaultTables) {
      if (!this.rooms.has(t.id)) {
        const botId = 'bot_host_' + t.code.toLowerCase();
        const hostPlayer: RoomPlayer = {
          id: botId,
          name: t.hostName,
          avatar: t.hostAvatar,
          isReady: true,
          isHost: true,
          isBot: true,
          chips: 10000,
          aiDifficulty: 'MEDIUM',
          aiPersonality: 'BALANCED',
        };

        const room: RoomState = {
          id: t.id,
          code: t.code,
          name: t.name,
          ante: t.ante,
          isPrivate: false,
          status: 'WAITING',
          players: [hostPlayer],
          createdAt: Date.now(),
          hostId: botId,
        };

        this.rooms.set(t.id, room);
        this.roomByCode.set(t.code, t.id);
      }
    }
  }

  public getPublicRooms(): PublicRoomInfo[] {
    const list: PublicRoomInfo[] = [];
    for (const room of this.rooms.values()) {
      if (!room.isPrivate && room.status === 'WAITING') {
        const host = room.players.find((p) => p.isHost);
        list.push({
          id: room.id,
          code: room.code,
          name: room.name,
          ante: room.ante,
          playerCount: room.players.length,
          maxPlayers: 3,
          hostName: host?.name || 'Unknown',
          hostAvatar: host?.avatar || 'avatar_1',
          status: room.status,
        });
      }
    }
    return list;
  }

  public broadcastPublicRooms() {
    const msg: ServerMessage = {
      type: 'ROOMS_LIST',
      payload: { rooms: this.getPublicRooms() },
    };
    const json = JSON.stringify(msg);
    this.connectedClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(json);
      }
    });
  }

  public createRoom(
    ws: WebSocket,
    params: {
      tableName: string;
      ante: number;
      isPrivate: boolean;
      playerName: string;
      playerAvatar: string;
    }
  ): { room: RoomState; playerId: string } {
    // Leave any existing room
    this.handleDisconnect(ws);

    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    let code = generateRoomCode();
    while (this.roomByCode.has(code)) {
      code = generateRoomCode();
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const hostPlayer: RoomPlayer = {
      id: playerId,
      name: params.playerName || 'Player 1',
      avatar: params.playerAvatar || 'avatar_1',
      isReady: true,
      isHost: true,
      isBot: false,
      chips: 10000,
    };

    const room: RoomState = {
      id: roomId,
      code,
      name: params.tableName || `${params.playerName}'s Table`,
      ante: params.ante || 5,
      isPrivate: !!params.isPrivate,
      status: 'WAITING',
      players: [hostPlayer],
      createdAt: Date.now(),
      hostId: playerId,
    };

    this.rooms.set(roomId, room);
    this.roomByCode.set(code, roomId);
    this.wsMap.set(ws, { roomId, playerId });
    this.playerSockets.set(playerId, ws);

    this.broadcastPublicRooms();
    return { room, playerId };
  }

  public joinRoom(
    ws: WebSocket,
    params: {
      roomCode: string;
      playerName: string;
      playerAvatar: string;
    }
  ): { success: boolean; error?: string; room?: RoomState; playerId?: string } {
    this.handleDisconnect(ws);

    const code = (params.roomCode || '').trim().toUpperCase();
    if (!code) {
      return { success: false, error: 'Please enter a valid room code.' };
    }

    let roomId = this.roomByCode.get(code);

    // If room code does not exist yet, auto-create the room on-demand with this code!
    // This allows friends sharing any custom code to meet seamlessly without "Room not found" errors!
    if (!roomId) {
      const newRoomId = 'room_' + Math.random().toString(36).substring(2, 9);
      const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
      const hostPlayer: RoomPlayer = {
        id: playerId,
        name: params.playerName || 'Player 1',
        avatar: params.playerAvatar || 'avatar_1',
        isReady: true,
        isHost: true,
        isBot: false,
        chips: 10000,
      };

      const room: RoomState = {
        id: newRoomId,
        code,
        name: `Table (${code})`,
        ante: 5,
        isPrivate: false,
        status: 'WAITING',
        players: [hostPlayer],
        createdAt: Date.now(),
        hostId: playerId,
      };

      this.rooms.set(newRoomId, room);
      this.roomByCode.set(code, newRoomId);
      this.wsMap.set(ws, { roomId: newRoomId, playerId });
      this.playerSockets.set(playerId, ws);

      this.broadcastPublicRooms();
      return { success: true, room, playerId };
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room does not exist.' };
    }

    if (room.status === 'PLAYING') {
      return { success: false, error: 'Match is already in progress.' };
    }

    if (room.players.length >= 3) {
      return { success: false, error: 'Room is full (max 3 players).' };
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);

    // If room has only bots, promote the joining human to host
    const isFirstHuman = !room.players.some((p) => !p.isBot);

    const newPlayer: RoomPlayer = {
      id: playerId,
      name: params.playerName || `Player ${room.players.length + 1}`,
      avatar: params.playerAvatar || 'avatar_2',
      isReady: isFirstHuman, // Host is ready by default
      isHost: isFirstHuman,
      isBot: false,
      chips: 10000,
    };

    if (isFirstHuman) {
      const oldHost = room.players.find((p) => p.isHost);
      if (oldHost) oldHost.isHost = false;
      room.hostId = playerId;
    }

    room.players.push(newPlayer);
    this.wsMap.set(ws, { roomId, playerId });
    this.playerSockets.set(playerId, ws);

    this.broadcastToRoom(roomId, {
      type: 'ROOM_UPDATED',
      payload: { room },
    });

    this.broadcastPublicRooms();
    return { success: true, room, playerId };
  }

  public fillBots(ws: WebSocket): { success: boolean; error?: string } {
    const sessionInfo = this.wsMap.get(ws);
    if (!sessionInfo) return { success: false, error: 'Not in a room.' };

    const room = this.rooms.get(sessionInfo.roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    if (room.hostId !== sessionInfo.playerId) {
      return { success: false, error: 'Only the host can fill empty seats with bots.' };
    }

    if (room.status === 'PLAYING') {
      return { success: false, error: 'Game already playing.' };
    }

    let botIndex = 0;
    while (room.players.length < 3) {
      const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
      const botAvatar = BOT_AVATARS[botIndex % BOT_AVATARS.length];
      const botPlayer: RoomPlayer = {
        id: 'bot_' + Math.random().toString(36).substring(2, 9),
        name: botName,
        avatar: botAvatar,
        isReady: true,
        isHost: false,
        isBot: true,
        chips: 10000,
        aiDifficulty: 'MEDIUM',
        aiPersonality: 'BALANCED',
      };
      room.players.push(botPlayer);
      botIndex++;
    }

    this.broadcastToRoom(room.id, {
      type: 'ROOM_UPDATED',
      payload: { room },
    });

    this.broadcastPublicRooms();
    return { success: true };
  }

  public toggleReady(ws: WebSocket, isReady?: boolean): { success: boolean; error?: string } {
    const sessionInfo = this.wsMap.get(ws);
    if (!sessionInfo) return { success: false, error: 'Not in a room.' };

    const room = this.rooms.get(sessionInfo.roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    const player = room.players.find((p) => p.id === sessionInfo.playerId);
    if (!player) return { success: false, error: 'Player not found.' };

    player.isReady = isReady !== undefined ? isReady : !player.isReady;

    this.broadcastToRoom(room.id, {
      type: 'ROOM_UPDATED',
      payload: { room },
    });

    return { success: true };
  }

  public startGame(ws: WebSocket): { success: boolean; error?: string } {
    const sessionInfo = this.wsMap.get(ws);
    if (!sessionInfo) return { success: false, error: 'Not in a room.' };

    const room = this.rooms.get(sessionInfo.roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    if (room.hostId !== sessionInfo.playerId) {
      return { success: false, error: 'Only the host can start the game.' };
    }

    if (room.players.length !== 3) {
      return { success: false, error: '3 players are required to start Tong-Its (add bots or invite players).' };
    }

    const unreadyPlayer = room.players.find((p) => !p.isReady);
    if (unreadyPlayer) {
      return { success: false, error: `${unreadyPlayer.name} is not ready.` };
    }

    room.status = 'PLAYING';

    const playerConfigs = room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      type: (p.isBot ? 'AI' : 'HUMAN') as 'HUMAN' | 'AI',
      aiDifficulty: p.aiDifficulty || 'MEDIUM',
      aiPersonality: p.aiPersonality || 'BALANCED',
    }));

    const gameSession = new GameSession(
      room.id,
      playerConfigs,
      {
        ante: room.ante,
        tableName: room.name,
        isMultiplayer: true,
      },
      () => {
        // onGameOver callback if needed
      }
    );

    this.sessions.set(room.id, gameSession);

    // Register all human sockets with the game session
    for (const player of room.players) {
      if (!player.isBot) {
        const sock = this.playerSockets.get(player.id);
        if (sock) {
          gameSession.registerSocket(player.id, sock);
        }
      }
    }

    this.broadcastPublicRooms();
    return { success: true };
  }

  public handleGameAction(
    ws: WebSocket,
    actionType: any,
    data: any
  ): { success: boolean; error?: string } {
    const sessionInfo = this.wsMap.get(ws);
    if (!sessionInfo) return { success: false, error: 'Not in a room.' };

    const session = this.sessions.get(sessionInfo.roomId);
    if (!session) return { success: false, error: 'No active game session.' };

    return session.handlePlayerAction(sessionInfo.playerId, actionType, data);
  }

  public handleChat(ws: WebSocket, message: string): { success: boolean; error?: string } {
    const sessionInfo = this.wsMap.get(ws);
    if (!sessionInfo) return { success: false, error: 'Not in a room.' };

    const session = this.sessions.get(sessionInfo.roomId);
    if (session) {
      session.broadcastChat(sessionInfo.playerId, message);
      return { success: true };
    }

    // Chat in lobby
    const room = this.rooms.get(sessionInfo.roomId);
    if (room) {
      const sender = room.players.find((p) => p.id === sessionInfo.playerId);
      this.broadcastToRoom(room.id, {
        type: 'CHAT_MESSAGE',
        payload: {
          senderId: sessionInfo.playerId,
          senderName: sender?.name || 'Player',
          message,
          timestamp: Date.now(),
        },
      });
      return { success: true };
    }

    return { success: false };
  }

  public handleDisconnect(ws: WebSocket) {
    const sessionInfo = this.wsMap.get(ws);
    if (!sessionInfo) return;

    const { roomId, playerId } = sessionInfo;
    this.wsMap.delete(ws);
    this.playerSockets.delete(playerId);

    const session = this.sessions.get(roomId);
    if (session) {
      session.removeSocket(playerId);
      let hasHumanLeft = false;
      for (const p of session.state.players) {
        if (p.type === 'HUMAN' && this.playerSockets.has(p.id)) {
          hasHumanLeft = true;
          break;
        }
      }
      if (!hasHumanLeft) {
        session.destroy();
        this.sessions.delete(roomId);
      }
    }

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove player
    room.players = room.players.filter((p) => p.id !== playerId);

    const defaultCodes = ['MNL99', 'CEB14', 'BAG88'];
    const isDefaultRoom = defaultCodes.includes(room.code);

    if (room.players.length === 0 || !room.players.some((p) => !p.isBot)) {
      if (isDefaultRoom) {
        // Reset default room with bot host
        const botId = 'bot_host_' + room.code.toLowerCase();
        room.status = 'WAITING';
        room.players = [
          {
            id: botId,
            name: `${room.name.split(' ')[0]} Bot`,
            avatar: 'avatar_3',
            isReady: true,
            isHost: true,
            isBot: true,
            chips: 10000,
          },
        ];
        room.hostId = botId;
      } else {
        // Custom room empty of humans, close it
        this.roomByCode.delete(room.code);
        this.rooms.delete(roomId);
      }

      const sess = this.sessions.get(roomId);
      if (sess) {
        sess.destroy();
        this.sessions.delete(roomId);
      }
    } else {
      // Reassign host if host left
      if (room.hostId === playerId) {
        const nextHuman = room.players.find((p) => !p.isBot);
        if (nextHuman) {
          nextHuman.isHost = true;
          nextHuman.isReady = true;
          room.hostId = nextHuman.id;
        }
      }

      this.broadcastToRoom(roomId, {
        type: 'ROOM_UPDATED',
        payload: { room },
      });
    }

    this.broadcastPublicRooms();
  }

  private broadcastToRoom(roomId: string, message: ServerMessage) {
    const json = JSON.stringify(message);
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const player of room.players) {
      if (!player.isBot) {
        const sock = this.playerSockets.get(player.id);
        if (sock && sock.readyState === WebSocket.OPEN) {
          sock.send(json);
        }
      }
    }
  }
}
