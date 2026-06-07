import http from 'node:http';
import { WebSocketServer } from 'ws';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number.parseInt(process.env.PORT || '8787', 10);

function clampScore(value) {
  const v = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(1000, Math.round(v)));
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getMatchWinner(winsA, winsB) {
  if (winsA > winsB) return 'A';
  if (winsB > winsA) return 'B';
  return 'draw';
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
  };
}

const rooms = new Map();

function broadcastRoom(room) {
  const payload = { type: 'room', data: roomPublicState(room) };
  for (const ws of room.sockets) {
    wsSend(ws, payload);
  }
}

function startRound(room, round) {
  room.status = 'in_round';
  room.round = round;
  room.punches.A = null;
  room.punches.B = null;

  const startAt = Date.now() + 400;
  const durationMs = 2500;
  const msg = { type: 'startRound', data: { round, startAt, durationMs } };
  for (const ws of room.sockets) {
    wsSend(ws, msg);
  }
  broadcastRoom(room);
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
  for (const ws of room.sockets) {
    wsSend(ws, msg);
  }

  if (room.round >= room.maxRounds) {
    room.status = 'finished';
    const matchWinner = getMatchWinner(room.wins.A, room.wins.B);
    const endMsg = { type: 'matchResult', data: { winner: matchWinner, wins: { ...room.wins }, results: room.results.map((x) => ({ ...x })) } };
    for (const ws of room.sockets) {
      wsSend(ws, endMsg);
    }
    broadcastRoom(room);
    return;
  }

  room.status = 'between_rounds';
  broadcastRoom(room);
  setTimeout(() => startRound(room, room.round + 1), 1200);
}

function removeSocketFromRoom(ws) {
  const roomCode = ws.__roomCode;
  const role = ws.__role;
  if (!roomCode || !role) return;

  const room = rooms.get(roomCode);
  if (!room) return;

  room.sockets.delete(ws);
  if (room.players[role]) {
    room.players[role].connected = false;
    room.players[role].ready = false;
  }

  for (const other of room.sockets) {
    wsSend(other, { type: 'opponentLeft', data: { role } });
  }

  if (room.sockets.size === 0) {
    rooms.delete(roomCode);
    return;
  }

  broadcastRoom(room);
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

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.__roomCode = null;
  ws.__role = null;

  ws.on('message', (raw) => {
    const message = safeJsonParse(String(raw));
    if (!message || typeof message !== 'object') {
      wsSend(ws, { type: 'error', data: { message: 'Invalid JSON message.' } });
      return;
    }

    const type = String(message.type || '');
    const data = message.data && typeof message.data === 'object' ? message.data : {};

    if (type === 'create') {
      const name = String(data.name || 'Player').slice(0, 18);
      let code = generateRoomCode();
      while (rooms.has(code)) code = generateRoomCode();

      const room = {
        code,
        createdAt: Date.now(),
        status: 'lobby',
        round: 0,
        maxRounds: 3,
        wins: { A: 0, B: 0 },
        results: [],
        punches: { A: null, B: null },
        players: { A: null, B: null },
        sockets: new Set(),
      };

      room.players.A = { name, ready: false, connected: true };
      room.sockets.add(ws);
      rooms.set(code, room);

      ws.__roomCode = code;
      ws.__role = 'A';

      wsSend(ws, { type: 'joined', data: { roomCode: code, role: 'A', state: roomPublicState(room) } });
      broadcastRoom(room);
      return;
    }

    if (type === 'join') {
      const roomCode = String(data.roomCode || '').trim().toUpperCase();
      const name = String(data.name || 'Player').slice(0, 18);
      if (!roomCode) {
        wsSend(ws, { type: 'error', data: { message: 'Room code is required.' } });
        return;
      }
      const room = rooms.get(roomCode);
      if (!room) {
        wsSend(ws, { type: 'error', data: { message: 'Room not found.' } });
        return;
      }

      const role = room.players.A && room.players.A.connected ? (!room.players.B || !room.players.B.connected ? 'B' : null) : 'A';
      if (!role) {
        wsSend(ws, { type: 'error', data: { message: 'Room is full.' } });
        return;
      }

      room.players[role] = { name, ready: false, connected: true };
      room.sockets.add(ws);
      ws.__roomCode = roomCode;
      ws.__role = role;

      wsSend(ws, { type: 'joined', data: { roomCode, role, state: roomPublicState(room) } });
      broadcastRoom(room);
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

    if (type === 'leave') {
      removeSocketFromRoom(ws);
      wsSend(ws, { type: 'left', data: {} });
      return;
    }

    wsSend(ws, { type: 'error', data: { message: 'Unknown message type.' } });
  });

  ws.on('close', () => {
    removeSocketFromRoom(ws);
  });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`PVP server listening on http://${HOST}:${PORT}\n`);
});
