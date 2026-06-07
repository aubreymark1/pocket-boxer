const MAX_ROUNDS = 3;
const STARTING_HP = 100;
const SCORE_MAX = 1000;

function clampHp(value) {
  return Math.max(0, Math.round(value));
}

function randomRobotMultiplier() {
  return 0.8 + Math.random() * 0.4;
}

function getWinner(playerHp, robotHp) {
  if (playerHp > robotHp) {
    return 'win';
  }

  if (playerHp < robotHp) {
    return 'lose';
  }

  return 'draw';
}

function scoreToDamage(score) {
  const safeScore = Math.max(0, Math.min(SCORE_MAX, Math.round(score)));

  if (safeScore <= 800) {
    return Math.max(8, Math.round((safeScore / 800) * 58));
  }

  const highScoreProgress = (safeScore - 800) / 200;
  return Math.max(8, Math.round(58 + highScoreProgress * 18));
}

export function createBattleController() {
  const state = {
    status: 'idle',
    currentRound: 1,
    roundsCompleted: 0,
    playerHp: STARTING_HP,
    robotHp: STARTING_HP,
    totalDamage: 0,
    highestScore: 0,
    winner: null,
    history: [],
    lastRoundSummary: null,
  };

  function getSnapshot() {
    return {
      status: state.status,
      currentRound: state.currentRound,
      roundsCompleted: state.roundsCompleted,
      maxRounds: MAX_ROUNDS,
      playerHp: state.playerHp,
      robotHp: state.robotHp,
      totalDamage: state.totalDamage,
      highestScore: state.highestScore,
      winner: state.winner,
      history: state.history.map((item) => ({ ...item })),
      lastRoundSummary: state.lastRoundSummary ? { ...state.lastRoundSummary } : null,
    };
  }

  function startBattle() {
    state.status = 'in_progress';
    state.currentRound = 1;
    state.roundsCompleted = 0;
    state.playerHp = STARTING_HP;
    state.robotHp = STARTING_HP;
    state.totalDamage = 0;
    state.highestScore = 0;
    state.winner = null;
    state.history = [];
    state.lastRoundSummary = null;
    return getSnapshot();
  }

  function resolveRound(result) {
    if (state.status !== 'in_progress') {
      throw new Error('战斗尚未开始。');
    }

    const score = Math.max(0, Math.min(SCORE_MAX, Math.round(result.score ?? 0)));
    const round = state.currentRound;
    const playerDamage = scoreToDamage(score);
    const robotDamage = Math.max(1, Math.round(playerDamage * randomRobotMultiplier()));

    state.robotHp = clampHp(state.robotHp - playerDamage);
    state.playerHp = clampHp(state.playerHp - robotDamage);
    state.roundsCompleted = round;
    state.totalDamage += playerDamage;
    state.highestScore = Math.max(state.highestScore, score);

    const roundSummary = {
      round,
      score,
      playerDamage,
      robotDamage,
      playerHp: state.playerHp,
      robotHp: state.robotHp,
    };

    state.history.push(roundSummary);
    state.lastRoundSummary = roundSummary;

    const battleFinished = state.robotHp <= 0 || state.playerHp <= 0 || round >= MAX_ROUNDS;
    if (battleFinished) {
      state.status = 'finished';
      state.winner = getWinner(state.playerHp, state.robotHp);
    } else {
      state.currentRound += 1;
    }

    return {
      ...getSnapshot(),
      roundSummary,
      battleFinished,
    };
  }

  return {
    startBattle,
    resolveRound,
    getSnapshot,
  };
}
