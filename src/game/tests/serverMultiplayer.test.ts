import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../../server/roomManager';
import { GameSession } from '../../../server/gameSession';

// Mock WebSocket for testing
function createMockWebSocket() {
  return {
    readyState: 1, // OPEN
    send: () => {},
    on: () => {},
    close: () => {},
  } as any;
}

describe('Server Multiplayer & RoomManager', () => {
  it('creates room with unique 6-character code and assigns host', () => {
    const manager = new RoomManager();
    const ws1 = createMockWebSocket();

    const { room, playerId } = manager.createRoom(ws1, {
      tableName: 'VIP Cebu Table',
      ante: 10,
      isPrivate: false,
      playerName: 'Noel',
      playerAvatar: 'avatar_1',
    });

    expect(room.code).toHaveLength(6);
    expect(room.name).toBe('VIP Cebu Table');
    expect(room.ante).toBe(10);
    expect(room.status).toBe('WAITING');
    expect(room.hostId).toBe(playerId);
    expect(room.players).toHaveLength(1);
    expect(room.players[0].name).toBe('Noel');
    expect(room.players[0].isHost).toBe(true);
    expect(room.players[0].isReady).toBe(true);

    const publicRooms = manager.getPublicRooms();
    expect(publicRooms).toHaveLength(1);
    expect(publicRooms[0].code).toBe(room.code);
  });

  it('allows second player to join via room code', () => {
    const manager = new RoomManager();
    const ws1 = createMockWebSocket();
    const ws2 = createMockWebSocket();

    const { room } = manager.createRoom(ws1, {
      tableName: 'Test Room',
      ante: 5,
      isPrivate: false,
      playerName: 'Player1',
      playerAvatar: 'avatar_1',
    });

    const joinRes = manager.joinRoom(ws2, {
      roomCode: room.code,
      playerName: 'Player2',
      playerAvatar: 'avatar_2',
    });

    expect(joinRes.success).toBe(true);
    expect(joinRes.room?.players).toHaveLength(2);
    expect(joinRes.room?.players[1].name).toBe('Player2');
    expect(joinRes.room?.players[1].isHost).toBe(false);
  });

  it('fills empty seats with AI bots', () => {
    const manager = new RoomManager();
    const ws1 = createMockWebSocket();

    manager.createRoom(ws1, {
      tableName: 'Test Room',
      ante: 5,
      isPrivate: false,
      playerName: 'Player1',
      playerAvatar: 'avatar_1',
    });

    const fillRes = manager.fillBots(ws1);
    expect(fillRes.success).toBe(true);

    const publicRooms = manager.getPublicRooms();
    expect(publicRooms[0].playerCount).toBe(3);
  });

  it('anti-cheat: masks opponent hands while preserving recipient hand and card counts', () => {
    const session = new GameSession(
      'session-1',
      [
        { id: 'p1', name: 'Alice', avatar: 'avatar_1', type: 'HUMAN' },
        { id: 'p2', name: 'Bob', avatar: 'avatar_2', type: 'HUMAN' },
        { id: 'p3', name: 'Bot Charlie', avatar: 'avatar_3', type: 'AI' },
      ],
      { ante: 10, tableName: 'Security Table', isMultiplayer: true }
    );

    const aliceView = session.getSanitizedState('p1');
    const alice = aliceView.players.find((p) => p.id === 'p1')!;
    const bob = aliceView.players.find((p) => p.id === 'p2')!;

    // Alice sees her actual cards
    expect(alice.hand[0].id).not.toContain('hidden');

    // Alice only sees masked cards for Bob with the exact same count
    expect(bob.hand.length).toBeGreaterThan(0);
    expect(bob.hand.every((c) => c.id.startsWith('hidden-p2-'))).toBe(true);

    session.destroy();
  });

  it('validates starting game requires 3 players and all ready', () => {
    const manager = new RoomManager();
    const ws1 = createMockWebSocket();
    const ws2 = createMockWebSocket();

    const { room } = manager.createRoom(ws1, {
      tableName: 'Launch Table',
      ante: 5,
      isPrivate: false,
      playerName: 'Host',
      playerAvatar: 'avatar_1',
    });

    // 1 player: cannot start
    expect(manager.startGame(ws1).success).toBe(false);

    // 2 players: cannot start
    manager.joinRoom(ws2, {
      roomCode: room.code,
      playerName: 'Guest',
      playerAvatar: 'avatar_2',
    });
    expect(manager.startGame(ws1).success).toBe(false);

    // Fill bots to reach 3 players
    manager.fillBots(ws1);

    // Guest is not ready yet: cannot start
    expect(manager.startGame(ws1).success).toBe(false);

    // Guest toggles ready
    manager.toggleReady(ws2, true);

    // All 3 ready: starts successfully!
    const startRes = manager.startGame(ws1);
    expect(startRes.success).toBe(true);
  });
});
