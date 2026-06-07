import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRoomState,
  createRoomSummary,
  getJoinableRooms,
  resolveMatchProgress,
} from './pvp-room-state.js';

test('createRoomSummary exposes host name and player count', () => {
  const room = createRoomState('ABCD12', 'Host');
  assert.deepEqual(createRoomSummary(room), {
    roomCode: 'ABCD12',
    hostName: 'Host',
    playerCount: 1,
    maxPlayers: 2,
    status: 'lobby',
  });
});

test('createRoomSummary falls back to the connected player when host disconnects', () => {
  const room = createRoomState('ABCD12', 'Host');
  room.players.A.connected = false;
  room.players.B = { name: 'Guest', ready: false, connected: true };

  assert.deepEqual(createRoomSummary(room), {
    roomCode: 'ABCD12',
    hostName: 'Guest',
    playerCount: 1,
    maxPlayers: 2,
    status: 'lobby',
  });
});

test('getJoinableRooms excludes full and in-progress rooms', () => {
  const lobbyRoom = createRoomState('OPEN01', 'Alice');
  const fullRoom = createRoomState('FULL01', 'Bob');
  fullRoom.players.B = { name: 'Cara', ready: false, connected: true };
  fullRoom.sockets.add({});

  const liveRoom = createRoomState('LIVE01', 'Duke');
  liveRoom.status = 'in_round';

  const rooms = new Map([
    [lobbyRoom.code, lobbyRoom],
    [fullRoom.code, fullRoom],
    [liveRoom.code, liveRoom],
  ]);

  assert.deepEqual(getJoinableRooms(rooms), [
    {
      roomCode: 'OPEN01',
      hostName: 'Alice',
      playerCount: 1,
      maxPlayers: 2,
      status: 'lobby',
    },
  ]);
});

test('resolveMatchProgress finishes regulation when one side leads after round three', () => {
  assert.deepEqual(
    resolveMatchProgress({
      round: 3,
      maxRounds: 3,
      wins: { A: 2, B: 1 },
      roundWinner: 'A',
    }),
    {
      battleFinished: true,
      matchWinner: 'A',
      nextRound: null,
      suddenDeath: false,
    },
  );
});

test('resolveMatchProgress enters sudden death when regulation ends in a tie', () => {
  assert.deepEqual(
    resolveMatchProgress({
      round: 3,
      maxRounds: 3,
      wins: { A: 1, B: 1 },
      roundWinner: 'draw',
    }),
    {
      battleFinished: false,
      matchWinner: null,
      nextRound: 4,
      suddenDeath: true,
    },
  );
});

test('resolveMatchProgress ends sudden death on the first non-draw overtime round', () => {
  assert.deepEqual(
    resolveMatchProgress({
      round: 4,
      maxRounds: 3,
      wins: { A: 2, B: 1 },
      roundWinner: 'A',
    }),
    {
      battleFinished: true,
      matchWinner: 'A',
      nextRound: null,
      suddenDeath: true,
    },
  );
});

test('resolveMatchProgress continues sudden death after an overtime draw', () => {
  assert.deepEqual(
    resolveMatchProgress({
      round: 5,
      maxRounds: 3,
      wins: { A: 1, B: 1 },
      roundWinner: 'draw',
    }),
    {
      battleFinished: false,
      matchWinner: null,
      nextRound: 6,
      suddenDeath: true,
    },
  );
});
