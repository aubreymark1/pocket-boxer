function countConnectedPlayers(room) {
  return ['A', 'B'].filter((role) => room.players[role]?.connected).length;
}

function getRoomHostName(room) {
  if (room.players.A?.connected) return room.players.A.name;
  if (room.players.B?.connected) return room.players.B.name;
  return room.players.A?.name || room.players.B?.name || 'Host';
}

export function createRoomState(code, hostName) {
  return {
    code,
    createdAt: Date.now(),
    status: 'lobby',
    round: 0,
    maxRounds: 3,
    wins: { A: 0, B: 0 },
    results: [],
    punches: { A: null, B: null },
    players: {
      A: { name: hostName, ready: false, connected: true },
      B: null,
    },
    sockets: new Set(),
  };
}

export function createRoomSummary(room) {
  return {
    roomCode: room.code,
    hostName: getRoomHostName(room),
    playerCount: countConnectedPlayers(room),
    maxPlayers: 2,
    status: room.status,
  };
}

export function getJoinableRooms(rooms) {
  return Array.from(rooms.values())
    .filter((room) => room.status === 'lobby')
    .filter((room) => countConnectedPlayers(room) < 2)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(createRoomSummary);
}

function getMatchWinner(winsA, winsB) {
  if (winsA > winsB) return 'A';
  if (winsB > winsA) return 'B';
  return 'draw';
}

export function resolveMatchProgress({ round, maxRounds, wins, roundWinner }) {
  const suddenDeath = round > maxRounds;
  const regulationEnded = round >= maxRounds;
  const matchWinner = getMatchWinner(wins.A, wins.B);

  if (!suddenDeath && !regulationEnded) {
    return {
      battleFinished: false,
      matchWinner: null,
      nextRound: round + 1,
      suddenDeath: false,
    };
  }

  if (!suddenDeath && matchWinner !== 'draw') {
    return {
      battleFinished: true,
      matchWinner,
      nextRound: null,
      suddenDeath: false,
    };
  }

  if (!suddenDeath && matchWinner === 'draw') {
    return {
      battleFinished: false,
      matchWinner: null,
      nextRound: round + 1,
      suddenDeath: true,
    };
  }

  if (roundWinner !== 'draw') {
    return {
      battleFinished: true,
      matchWinner: roundWinner,
      nextRound: null,
      suddenDeath: true,
    };
  }

  return {
    battleFinished: false,
    matchWinner: null,
    nextRound: round + 1,
    suddenDeath: true,
  };
}
