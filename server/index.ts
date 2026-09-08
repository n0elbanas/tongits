import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './roomManager';
import { ClientMessage, ServerMessage } from './types';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const roomManager = new RoomManager();

// Create HTTP server for health checks & reverse proxy validation
const server = http.createServer((req, res) => {
  // Simple CORS headers for health check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'online',
        service: 'tongits-websocket-server',
        timestamp: Date.now(),
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Setup WebSocket server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  // Accept /ws or /ws/ or root upgrade
  if (url.startsWith('/ws') || url === '/') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

wss.on('connection', (ws: WebSocket) => {
  // Send public rooms list on initial connect
  send(ws, {
    type: 'ROOMS_LIST',
    payload: { rooms: roomManager.getPublicRooms() },
  });

  ws.on('message', (raw: Buffer | string) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'GET_ROOMS': {
          send(ws, {
            type: 'ROOMS_LIST',
            payload: { rooms: roomManager.getPublicRooms() },
          });
          break;
        }

        case 'CREATE_ROOM': {
          const { room, playerId } = roomManager.createRoom(ws, msg.payload);
          send(ws, {
            type: 'ROOM_JOINED',
            payload: { room, myPlayerId: playerId },
          });
          break;
        }

        case 'JOIN_ROOM': {
          const res = roomManager.joinRoom(ws, msg.payload);
          if (!res.success || !res.room || !res.playerId) {
            send(ws, {
              type: 'ERROR',
              payload: { message: res.error || 'Failed to join room' },
            });
          } else {
            send(ws, {
              type: 'ROOM_JOINED',
              payload: { room: res.room, myPlayerId: res.playerId },
            });
          }
          break;
        }

        case 'LEAVE_ROOM': {
          roomManager.handleDisconnect(ws);
          send(ws, {
            type: 'ROOMS_LIST',
            payload: { rooms: roomManager.getPublicRooms() },
          });
          break;
        }

        case 'FILL_BOTS': {
          const res = roomManager.fillBots(ws);
          if (!res.success) {
            send(ws, {
              type: 'ERROR',
              payload: { message: res.error || 'Could not add bots' },
            });
          }
          break;
        }

        case 'TOGGLE_READY': {
          const res = roomManager.toggleReady(ws, msg.payload?.isReady);
          if (!res.success) {
            send(ws, {
              type: 'ERROR',
              payload: { message: res.error || 'Could not toggle ready' },
            });
          }
          break;
        }

        case 'START_GAME': {
          const res = roomManager.startGame(ws);
          if (!res.success) {
            send(ws, {
              type: 'ERROR',
              payload: { message: res.error || 'Cannot start game' },
            });
          }
          break;
        }

        case 'GAME_ACTION': {
          const res = roomManager.handleGameAction(ws, msg.payload.actionType, msg.payload.data);
          if (!res.success) {
            send(ws, {
              type: 'ERROR',
              payload: { message: res.error || 'Invalid move' },
            });
          }
          break;
        }

        case 'SEND_CHAT': {
          roomManager.handleChat(ws, msg.payload.message);
          break;
        }

        case 'PING': {
          send(ws, { type: 'PONG' });
          break;
        }
      }
    } catch (err: any) {
      send(ws, {
        type: 'ERROR',
        payload: { message: 'Malformed JSON message.' },
      });
    }
  });

  ws.on('close', () => {
    roomManager.handleDisconnect(ws);
  });

  ws.on('error', () => {
    roomManager.handleDisconnect(ws);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[Tong-Its Server] WebSocket server listening on ws://${HOST}:${PORT}/ws`);
});
