import http from 'node:http';
import { WebSocketServer } from 'ws';
import {
  createRoomState,
  getJoinableRooms,
  getSpectatableRooms,
  resolveMatchProgress,
} from './pvp-room-state.js';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number.parseInt(process.env.PORT || '8787', 10);
const BETWEEN_ROUNDS_MS = 4200;

function clampScore(value) {
  const v = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(1000, Math.round(v)));
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function wsSend(ws, message) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(message));
}

function roomPublicState(room) {
  const players = {
    A: room.players.A ? { name: room.players.A.name, ready: room.players.A.ready, connected: room.players.A.connected } : null,
    B: room.players.B ? { name: room.players.B.name, ready: room.players.B.ready, connected: room.players.B.connected } : null,
  };

  return {
    roomCode: room.code,
    status: room.status,
    round: room.round,
    maxRounds: room.maxRounds,
    players,
    wins: { ...room.wins },
    results: room.results.map((item) => ({ ...item })),
    spectatorCount: room.spectators.size,
  };
}

const rooms = new Map();
let wss;

function broadcastRoom(room) {
  const payload = { type: 'room', data: roomPublicState(room) };
  for (const ws of room.sockets) {
    wsSend(ws, payload);
  }
  for (const ws of room.spectators) {
    wsSend(ws, payload);
  }
}

function joinableRoomsPayload() {
  return {
    type: 'roomList',
    data: getJoinableRooms(rooms),
  };
}

function spectatableRoomsPayload() {
  return {
    type: 'spectatableRooms',
    data: getSpectatableRooms(rooms),
  };
}

function sendRoomList(ws) {
  wsSend(ws, joinableRoomsPayload());
}

function sendSpectatableRooms(ws) {
  wsSend(ws, spectatableRoomsPayload());
}

function broadcastJoinableRooms() {
  if (!wss) return;

  const payload = joinableRoomsPayload();
  for (const ws of wss.clients) {
    wsSend(ws, payload);
  }
}

function broadcastSpectatableRooms() {
  if (!wss) return;

  const payload = spectatableRoomsPayload();
  for (const ws of wss.clients) {
    wsSend(ws, payload);
  }
}

function broadcastAudience(room, message) {
  for (const ws of room.sockets) {
    wsSend(ws, message);
  }
  for (const ws of room.spectators) {
    wsSend(ws, message);
  }
}

function refreshPublicLists() {
  broadcastJoinableRooms();
  broadcastSpectatableRooms();
}

function removeSpectatorFromRoom(ws) {
  const roomCode = ws.__spectatingRoomCode;
  if (!roomCode) return null;

  ws.__spectatingRoomCode = null;
  const room = rooms.get(roomCode);
  if (!room) return null;
  room.spectators.delete(ws);
  return room;
}

function clearSpectatorsForInterruptedRoom(room, message) {
  for (const spectator of room.spectators) {
    spectator.__spectatingRoomCode = null;
    wsSend(spectator, { type: 'matchInterrupted', data: message });
  }
  room.spectators.clear();
}

function startRound(room, round) {
  room.status = 'in_round';
  room.round = round;
  room.punches.A = null;
  room.punches.B = null;

  const startAt = Date.now() + 400;
  const durationMs = 2500;
  const msg = { type: 'startRound', data: { round, startAt, durationMs } };
  broadcastAudience(room, msg);
  broadcastRoom(room);
  refreshPublicLists();
}

function tryResolveRound(room) {
  const a = room.punches.A;
  const b = room.punches.B;
  if (!a || !b) return;

  const aScore = clampScore(a.score);
  const bScore = clampScore(b.score);
  const winner = aScore === bScore ? 'draw' : aScore > bScore ? 'A' : 'B';
  if (winner === 'A') room.wins.A += 1;
  if (winner === 'B') room.wins.B += 1;

  const roundResult = { round: room.round, A: { score: aScore }, B: { score: bScore }, winner };
  room.results.push(roundResult);

  const msg = { type: 'roundResult', data: roundResult };
  broadcastAudience(room, msg);

  const progress = resolveMatchProgress({
    round: room.round,
    maxRounds: room.maxRounds,
    wins: room.wins,
    roundWinner: winner,
  });

  if (progress.battleFinished) {
    room.status = 'finished';
    const endMsg = {
      type: 'matchResult',
      data: {
        winner: progress.matchWinner,
        wins: { ...room.wins },
        results: room.results.map((x) => ({ ...x })),
      },
    };
    broadcastAudience(room, endMsg);
    broadcastRoom(room);
    refreshPublicLists();
    return;
  }

  room.status = 'between_rounds';
  broadcastRoom(room);
  refreshPublicLists();
  setTimeout(() => startRound(room, progress.nextRound), BETWEEN_ROUNDS_MS);
}

function removeSocketFromRoom(ws) {
  const roomCode = ws.__roomCode;
  const role = ws.__role;
  if (!roomCode || !role) return;

  ws.__roomCode = null;
  ws.__role = null;

  const room = rooms.get(roomCode);
  if (!room) return;

  room.sockets.delete(ws);
  if (room.players[role]) {
    room.players[role].connected = false;
    room.players[role].ready = false;
  }

  if (room.spectators.size) {
    clearSpectatorsForInterruptedRoom(room, {
      roomCode,
      message: '比赛中断：有玩家离开了房间。',
    });
  }

  for (const other of room.sockets) {
    wsSend(other, { type: 'opponentLeft', data: { role } });
  }

  if (room.sockets.size === 0) {
    rooms.delete(roomCode);
    refreshPublicLists();
    return;
  }

  broadcastRoom(room);
  refreshPublicLists();
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, host: HOST, port: PORT, rooms: rooms.size }));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Pocket Boxer PVP WebSocket server\n');
});

wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.__roomCode = null;
  ws.__role = null;
  ws.__spectatingRoomCode = null;

  ws.on('message', (raw) => {
    const message = safeJsonParse(String(raw));
    if (!message || typeof message !== 'object') {
      wsSend(ws, { type: 'error', data: { message: 'Invalid JSON message.' } });
      return;
    }

    const type = String(message.type || '');
    const data = message.data && typeof message.data === 'object' ? message.data : {};

    if (type === 'listRooms') {
      sendRoomList(ws);
      return;
    }

    if (type === 'listSpectatableRooms') {
      sendSpectatableRooms(ws);
      return;
    }

    if (type === 'create') {
      removeSpectatorFromRoom(ws);
      if (ws.__roomCode) {
        wsSend(ws, { type: 'error', data: { message: 'Already in a room.' } });
        return;
      }
      const name = String(data.name || 'Player').slice(0, 18);
      let code = generateRoomCode();
      while (rooms.has(code)) code = generateRoomCode();

      const room = createRoomState(code, name);
      room.sockets.add(ws);
      rooms.set(code, room);

      ws.__roomCode = code;
      ws.__role = 'A';

      wsSend(ws, { type: 'joined', data: { roomCode: code, role: 'A', state: roomPublicState(room) } });
      broadcastRoom(room);
      refreshPublicLists();
      return;
    }

    if (type === 'join') {
      removeSpectatorFromRoom(ws);
      if (ws.__roomCode) {
        wsSend(ws, { type: 'error', data: { message: 'Already in a room.' } });
        return;
      }
      const roomCode = String(data.roomCode || '').trim().toUpperCase();
      const name = String(data.name || 'Player').slice(0, 18);
      if (!roomCode) {
        wsSend(ws, { type: 'error', data: { message: 'Room code is required.' } });
        sendRoomList(ws);
        return;
      }
      const room = rooms.get(roomCode);
      if (!room) {
        wsSend(ws, { type: 'error', data: { message: 'Room not found.' } });
        sendRoomList(ws);
        return;
      }
      if (room.status !== 'lobby') {
        wsSend(ws, { type: 'error', data: { message: 'Room is no longer joinable.' } });
        sendRoomList(ws);
        return;
      }

      const role = room.players.A && room.players.A.connected ? (!room.players.B || !room.players.B.connected ? 'B' : null) : 'A';
      if (!role) {
        wsSend(ws, { type: 'error', data: { message: 'Room is full.' } });
        sendRoomList(ws);
        return;
      }

      room.players[role] = { name, ready: false, connected: true };
      room.sockets.add(ws);
      ws.__roomCode = roomCode;
      ws.__role = role;

      wsSend(ws, { type: 'joined', data: { roomCode, role, state: roomPublicState(room) } });
      broadcastRoom(room);
      refreshPublicLists();
      return;
    }

    if (type === 'watchRoom') {
      if (ws.__roomCode) {
        wsSend(ws, { type: 'error', data: { message: 'Players cannot spectate from the same connection.' } });
        return;
      }

      const roomCode = String(data.roomCode || '').trim().toUpperCase();
      if (!roomCode) {
        wsSend(ws, { type: 'error', data: { message: 'Room code is required.' } });
        sendSpectatableRooms(ws);
        return;
      }

      const room = rooms.get(roomCode);
      const watchable = room && (room.status === 'in_round' || room.status === 'between_rounds');
      if (!watchable) {
        wsSend(ws, { type: 'error', data: { message: 'Match is no longer available for spectating.' } });
        sendSpectatableRooms(ws);
        return;
      }

      const previousRoom = removeSpectatorFromRoom(ws);
      if (previousRoom) {
        broadcastRoom(previousRoom);
      }

      ws.__spectatingRoomCode = roomCode;
      room.spectators.add(ws);
      wsSend(ws, { type: 'spectatorJoined', data: { roomCode, state: roomPublicState(room) } });
      broadcastRoom(room);
      sendSpectatableRooms(ws);
      return;
    }

    if (type === 'ready') {
      const roomCode = ws.__roomCode;
      const role = ws.__role;
      const room = roomCode ? rooms.get(roomCode) : null;
      if (!room || !role || !room.players[role]) {
        wsSend(ws, { type: 'error', data: { message: 'Not in a room.' } });
        return;
      }

      room.players[role].ready = true;
      broadcastRoom(room);
      refreshPublicLists();

      const bothReady = room.players.A?.connected && room.players.B?.connected && room.players.A?.ready && room.players.B?.ready;
      if (bothReady && room.status === 'lobby') {
        startRound(room, 1);
      }
      return;
    }

    if (type === 'punch') {
      const roomCode = ws.__roomCode;
      const role = ws.__role;
      const room = roomCode ? rooms.get(roomCode) : null;
      if (!room || !role) {
        wsSend(ws, { type: 'error', data: { message: 'Not in a room.' } });
        return;
      }
      if (room.status !== 'in_round') {
        wsSend(ws, { type: 'error', data: { message: 'Round is not active.' } });
        return;
      }

      const round = Number.parseInt(data.round, 10);
      if (!Number.isFinite(round) || round !== room.round) {
        wsSend(ws, { type: 'error', data: { message: 'Round mismatch.' } });
        return;
      }

      room.punches[role] = {
        score: clampScore(data.score),
        source: String(data.source || ''),
        at: Date.now(),
      };

      wsSend(ws, { type: 'punchAck', data: { round: room.round, role } });
      broadcastRoom(room);
      tryResolveRound(room);
      return;
    }

    if (type === 'leaveSpectator') {
      const room = removeSpectatorFromRoom(ws);
      if (room) {
        broadcastRoom(room);
      }
      wsSend(ws, { type: 'spectatorLeft', data: {} });
      sendSpectatableRooms(ws);
      return;
    }

    if (type === 'leave') {
      removeSocketFromRoom(ws);
      wsSend(ws, { type: 'left', data: {} });
      sendRoomList(ws);
      sendSpectatableRooms(ws);
      return;
    }

    wsSend(ws, { type: 'error', data: { message: 'Unknown message type.' } });
  });

  ws.on('close', () => {
    const room = removeSpectatorFromRoom(ws);
    if (room) {
      broadcastRoom(room);
    }
    removeSocketFromRoom(ws);
  });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`PVP server listening on http://${HOST}:${PORT}\n`);
});
