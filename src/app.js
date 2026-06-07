import { createMotionController } from './motion.js';
import { feedbackModule } from './feedback.js';
import { createBattleController } from './battle.js';
import { createPvpClient } from './pvp.js';

const MODE_TEST = 'test';
const MODE_BATTLE = 'battle';
const MODE_PVP = 'pvp';
const DEFAULT_BATTLE_CHALLENGE = '拳击机器人';
const BUTTON_PUNCH_POP_MS = 560;
const BUTTON_PUNCH_TRANSITION_DELAY_MS = 180;
const COUNTDOWN_PUNCH_CUE_MS = 680;
const MOTION_PUNCH_AUDIO_DELTA = 8;
const SCORE_MAX = 1000;
const BATTLE_DAMAGE_SCALE = 0.075;
const BATTLE_TIMINGS = {
  postPunchTransition: 260,
  playerWindup: 260,
  playerImpactHold: 760,
  robotWindup: 260,
  robotImpactHold: 840,
  nextRoundBuffer: 1250,
};
const PVP_STATUS_READ_MS = 2400;

const screens = {
  home: document.getElementById('screen-home'),
  safety: document.getElementById('screen-safety'),
  calibrating: document.getElementById('screen-calibrating'),
  countdown: document.getElementById('screen-countdown'),
  punch: document.getElementById('screen-punch'),
  result: document.getElementById('screen-result'),
  battlePrep: document.getElementById('screen-battle-prep'),
  battleStatus: document.getElementById('screen-battle-status'),
  battleResult: document.getElementById('screen-battle-result'),
  pvp: document.getElementById('screen-pvp'),
};

const countdownDisplay = document.getElementById('countdown-display');
const countdownContext = document.getElementById('countdown-context');
const motionUi = document.getElementById('punch-motion-ui');
const fallbackUi = document.getElementById('punch-fallback-ui');
const chargeFill = document.getElementById('fallback-charge-fill');
const fallbackBtn = document.getElementById('btn-fallback-charge');
const appContainer = document.getElementById('app-container');

const btnModeTest = document.getElementById('btn-mode-test');
const btnModeBattle = document.getElementById('btn-mode-battle');
const btnModePvp = document.getElementById('btn-mode-pvp');
const btnSafetyOk = document.getElementById('btn-safety-ok');
const btnSafetyHome = document.getElementById('btn-safety-home');
const btnResultRetry = document.getElementById('btn-result-retry');
const btnResultBattle = document.getElementById('btn-result-battle');
const btnResultHome = document.getElementById('btn-result-home');
const btnBattleStart = document.getElementById('btn-battle-start');
const btnBattlePrepHome = document.getElementById('btn-battle-prep-home');
const btnBattleNext = document.getElementById('btn-battle-next');
const btnBattleStatusHome = document.getElementById('btn-battle-status-home');
const btnBattleRestart = document.getElementById('btn-battle-restart');
const btnBattleResultHome = document.getElementById('btn-battle-result-home');
const btnPvpHome = document.getElementById('btn-pvp-home');
const battleChallengeInput = document.getElementById('battle-challenge-input');
const pvpNameInput = document.getElementById('pvp-name');
const pvpRoomCodeInput = document.getElementById('pvp-room-code');
const btnPvpCreate = document.getElementById('btn-pvp-create');
const btnPvpJoin = document.getElementById('btn-pvp-join');
const btnPvpReady = document.getElementById('btn-pvp-ready');
const btnPvpLeave = document.getElementById('btn-pvp-leave');
const pvpModeBadge = document.getElementById('pvp-mode-badge');
const pvpStatus = document.getElementById('pvp-status');
const pvpRoomLabel = document.getElementById('pvp-room-label');
const pvpPlayerYouLabel = document.getElementById('pvp-player-you-label');
const pvpPlayerYou = document.getElementById('pvp-player-you');
const pvpPlayerYouReady = document.getElementById('pvp-player-you-ready');
const pvpPlayerOppLabel = document.getElementById('pvp-player-opp-label');
const pvpPlayerOpp = document.getElementById('pvp-player-opp');
const pvpPlayerOppReady = document.getElementById('pvp-player-opp-ready');
const pvpRoundLabel = document.getElementById('pvp-round');
const pvpScoreYouLabel = document.getElementById('pvp-score-you-label');
const pvpScoreYou = document.getElementById('pvp-score-you');
const pvpScoreOppLabel = document.getElementById('pvp-score-opp-label');
const pvpScoreOpp = document.getElementById('pvp-score-opp');
const pvpRoundOutcome = document.getElementById('pvp-round-outcome');
const pvpRoomList = document.getElementById('pvp-room-list');
const pvpRoomListEmpty = document.getElementById('pvp-room-list-empty');
const pvpRoomListMeta = document.getElementById('pvp-room-list-meta');
const pvpSpectatorList = document.getElementById('pvp-spectator-list');
const pvpSpectatorListEmpty = document.getElementById('pvp-spectator-list-empty');
const pvpSpectatorListMeta = document.getElementById('pvp-spectator-list-meta');

const safetyTitle = document.getElementById('safety-title');
const safetyCopy = document.getElementById('safety-copy');
const safetySubcopy = document.getElementById('safety-subcopy');
const punchInstruction = document.getElementById('punch-instruction');
const battlePrepCopy = document.getElementById('battle-prep-copy');
const battleChallengePreview = document.getElementById('battle-challenge-preview');
const battlePrepOpponentLabel = document.getElementById('battle-prep-opponent-label');
const battleHudRobotLabel = document.getElementById('battle-hud-robot-label');
const fighterRobotLabel = document.getElementById('fighter-robot-label');
const battleStatusRobotLabel = document.getElementById('battle-status-robot-label');
const battleFinalRobotLabel = document.getElementById('battle-final-robot-label');

const resultTitle = document.getElementById('result-title');
const resScore = document.getElementById('res-score');
const resDamage = document.getElementById('res-damage');
const resRating = document.getElementById('res-rating');
const resTitle = document.getElementById('res-title');
const resCopy = document.getElementById('res-copy');
const resTier = document.getElementById('res-tier');
const resMeterLabel = document.getElementById('res-meter-label');
const resMeterFill = document.getElementById('res-meter-fill');
const bagResult = document.getElementById('bag-result');
const punchStage = document.getElementById('punch-stage');

const battleHud = document.getElementById('battle-hud');
const battlePlayerLabel = document.getElementById('battle-player-label');
const battleRoundLabel = document.getElementById('battle-round-label');
const battleRound = document.getElementById('battle-round');
const battlePlayerHp = document.getElementById('battle-player-hp');
const battleRobotHp = document.getElementById('battle-robot-hp');
const battleStatusTitle = document.getElementById('battle-status-title');
const battleStatusPhase = document.getElementById('battle-status-phase');
const battleStatusCopy = document.getElementById('battle-status-copy');
const battleStatusPlayerLabel = document.getElementById('battle-status-player-label');
const battleStatusPlayerHp = document.getElementById('battle-status-player-hp');
const battleStatusRobotHp = document.getElementById('battle-status-robot-hp');
const battleArena = document.getElementById('battle-arena');
const fighterPlayer = document.getElementById('fighter-player');
const fighterRobot = document.getElementById('fighter-robot');
const battleChallengeCore = document.getElementById('battle-challenge-core');
const battlePopupPlayer = document.getElementById('battle-popup-player');
const battlePopupRobot = document.getElementById('battle-popup-robot');
const battleResultScreen = document.getElementById('screen-battle-result');
const battleResultKicker = document.getElementById('battle-result-kicker');
const battleResultTitle = document.getElementById('battle-result-title');
const battleResultDefeated = document.getElementById('battle-result-defeated');
const battleResultCopy = document.getElementById('battle-result-copy');
const battleFinalPlayerLabel = document.getElementById('battle-final-player-label');
const battleFinalPlayerHp = document.getElementById('battle-final-player-hp');
const battleFinalRobotHp = document.getElementById('battle-final-robot-hp');
const battleFinalDamage = document.getElementById('battle-final-damage');
const battleFinalScore = document.getElementById('battle-final-score');

const bagPunch = document.getElementById('bag-punch');
let motionPunchCuePlayed = false;
let pointerActive = false;
const buttonPopTimeouts = new WeakMap();

const appState = {
  selectedMode: MODE_TEST,
  activePunchContext: MODE_TEST,
  battleAutoAdvanceToken: 0,
  battleChallengeName: DEFAULT_BATTLE_CHALLENGE,
};

const battleController = createBattleController();

const pvpRuntime = {
  status: 'idle',
  role: '',
  roomCode: '',
  watchedRoomCode: '',
  viewMode: 'none',
  currentRound: 0,
  maxRounds: 3,
  youScore: null,
  oppScore: null,
  winsYou: 0,
  winsOpp: 0,
  playerName: '你',
  opponentName: '对手',
  history: [],
  finalResult: null,
  isStatusAnimating: false,
  outcome: '未连接',
  winner: null,
};

const pvpClient = createPvpClient({
  onEvent: (event) => {
    handlePvpEvent(event);
  },
  onStatus: (snapshot) => {
    handlePvpStatus(snapshot);
  },
});

const motionController = createMotionController({
  onUpdate(snapshot) {
    if (snapshot.chargeActive && chargeFill) {
      chargeFill.style.width = `${snapshot.fallbackCharge}%`;
    }

    if (snapshot.isPunchTestActive && bagPunch) {
      const delta = snapshot.peakDelta || 0;
      const scale = 1 + Math.min(delta / 20, 0.4);
      const rotate = Math.sin(Date.now() / 50) * (delta / 1.5);
      bagPunch.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

      if (!motionPunchCuePlayed && delta >= MOTION_PUNCH_AUDIO_DELTA) {
        motionPunchCuePlayed = true;
        feedbackModule.punch();
      }
    }
  },
});

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => {
    if (screen) {
      screen.classList.remove('active');
    }
  });

  if (screens[screenName]) {
    screens[screenName].classList.add('active');
  }
}

function triggerButtonPunchPop(button) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  button.classList.remove('button-punch-pop');
  void button.offsetWidth;
  button.classList.add('button-punch-pop');

  const existingTimeout = buttonPopTimeouts.get(button);
  if (existingTimeout) {
    window.clearTimeout(existingTimeout);
  }

  const timeoutId = window.setTimeout(() => {
    button.classList.remove('button-punch-pop');
    buttonPopTimeouts.delete(button);
  }, BUTTON_PUNCH_POP_MS);

  buttonPopTimeouts.set(button, timeoutId);
}

function runAfterButtonPunchPop(button, callback, delayMs = BUTTON_PUNCH_TRANSITION_DELAY_MS) {
  triggerButtonPunchPop(button);
  window.setTimeout(() => {
    callback();
  }, delayMs);
}

function setCountdownDisplay(value, { isPunchCue = false } = {}) {
  countdownDisplay.textContent = value;
  countdownDisplay.classList.toggle('is-punch-cue', isPunchCue);
}

function goHome() {
  motionController.resetResult();
  pointerActive = false;
  appState.selectedMode = MODE_TEST;
  appState.activePunchContext = MODE_TEST;
  appState.battleAutoAdvanceToken += 1;
  battleHud.style.display = 'none';
  const pvpSnapshot = pvpClient.getSnapshot();
  if (pvpSnapshot.viewMode === 'spectator') {
    pvpClient.leaveSpectator();
  } else if (pvpSnapshot.roomCode) {
    pvpClient.leave();
  }
  resetPvpMatchState('未连接');
  showScreen('home');
}

function openPvp() {
  motionController.resetResult();
  pointerActive = false;
  appState.selectedMode = MODE_PVP;
  appState.activePunchContext = MODE_PVP;
  resetPvpMatchState('正在连接...');
  updatePvpUi();
  showScreen('pvp');
  void ensurePvpConnected().then((ok) => {
    if (ok) {
      refreshPvpRoomList();
      refreshPvpSpectatorList();
      return;
    }
    setPvpOutcome('无法连接服务器');
  });
}

function getPvpInputName() {
  const raw = pvpNameInput?.value ?? '';
  const normalized = String(raw).trim().slice(0, 18);
  return normalized || 'Player';
}

function getPvpInputRoomCode() {
  const raw = pvpRoomCodeInput?.value ?? '';
  return String(raw).trim().toUpperCase();
}

function resetPvpMatchState(outcome = '未连接') {
  pvpRuntime.viewMode = 'none';
  pvpRuntime.watchedRoomCode = '';
  pvpRuntime.currentRound = 0;
  pvpRuntime.maxRounds = 3;
  pvpRuntime.youScore = null;
  pvpRuntime.oppScore = null;
  pvpRuntime.winsYou = 0;
  pvpRuntime.winsOpp = 0;
  pvpRuntime.playerName = getPvpInputName();
  pvpRuntime.opponentName = '对手';
  pvpRuntime.history = [];
  pvpRuntime.finalResult = null;
  pvpRuntime.isStatusAnimating = false;
  pvpRuntime.winner = null;
  pvpRuntime.outcome = outcome;
}

function refreshPvpRoomList() {
  const snapshot = pvpClient.getSnapshot();
  if (snapshot.status === 'connected') {
    pvpClient.listRooms();
  }
}

function refreshPvpSpectatorList() {
  const snapshot = pvpClient.getSnapshot();
  if (snapshot.status === 'connected') {
    pvpClient.listSpectatableRooms();
  }
}

function isPvpSuddenDeathRound(round) {
  return Number.parseInt(round, 10) > (pvpRuntime.maxRounds || 3);
}

function getPvpRoundLabel(round) {
  const normalizedRound = Number.parseInt(round, 10);
  if (!Number.isFinite(normalizedRound) || normalizedRound <= 0) {
    return '-';
  }

  if (isPvpSuddenDeathRound(normalizedRound)) {
    return `Sudden Death Round ${normalizedRound}`;
  }

  return `Round ${normalizedRound} / ${pvpRuntime.maxRounds}`;
}

function getPvpRoundHudLabel(round) {
  const normalizedRound = Number.parseInt(round, 10);
  if (!Number.isFinite(normalizedRound) || normalizedRound <= 0) {
    return '-';
  }

  if (isPvpSuddenDeathRound(normalizedRound)) {
    return `SD ${normalizedRound}`;
  }

  return `${normalizedRound} / ${pvpRuntime.maxRounds}`;
}

async function joinPvpRoomFromLobby(roomCode) {
  const ok = await ensurePvpConnected();
  if (!ok) {
    setPvpOutcome('无法连接服务器');
    return;
  }

  const normalizedCode = String(roomCode || '').trim().toUpperCase();
  if (!normalizedCode) {
    setPvpOutcome('请输入房间码');
    return;
  }

  if (pvpRoomCodeInput) {
    pvpRoomCodeInput.value = normalizedCode;
  }
  pvpClient.joinRoom(normalizedCode, getPvpInputName());
  setPvpOutcome('正在加入房间...');
}

function getDefaultPvpUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const hostname = window.location.hostname;

  if (!host || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:8787';
  }

  return `${protocol}//${host}/ws`;
}

async function ensurePvpConnected() {
  const url = getDefaultPvpUrl();
  const snapshot = pvpClient.getSnapshot();
  if (snapshot.status === 'connected' && snapshot.url === url) {
    return true;
  }

  pvpClient.connect(url);
  for (let i = 0; i < 35; i += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    const current = pvpClient.getSnapshot();
    if (current.status === 'connected') return true;
    if (current.status === 'disconnected') break;
  }
  return false;
}

function getPvpSides(snapshot = pvpClient.getSnapshot()) {
  const room = snapshot.room;
  const youRole = snapshot.role || '';
  const oppRole = youRole === 'A' ? 'B' : youRole === 'B' ? 'A' : '';
  const you = youRole && room?.players?.[youRole] ? room.players[youRole] : null;
  const opp = oppRole && room?.players?.[oppRole] ? room.players[oppRole] : null;
  return { room, youRole, oppRole, you, opp };
}

function getPvpDisplayState(snapshot = pvpClient.getSnapshot()) {
  const isSpectator = snapshot.viewMode === 'spectator';
  if (isSpectator) {
    return {
      room: snapshot.room,
      isSpectator: true,
      primaryRole: 'A',
      secondaryRole: 'B',
      primary: snapshot.room?.players?.A || null,
      secondary: snapshot.room?.players?.B || null,
    };
  }

  const { room, youRole, oppRole, you, opp } = getPvpSides(snapshot);
  return {
    room,
    isSpectator: false,
    primaryRole: youRole,
    secondaryRole: oppRole,
    primary: you,
    secondary: opp,
  };
}

function getPvpDisplayRoomCode(snapshot = pvpClient.getSnapshot()) {
  return snapshot.viewMode === 'spectator' ? snapshot.watchedRoomCode : snapshot.roomCode;
}

function getPvpRoundPerspective(data, snapshot = pvpClient.getSnapshot()) {
  const isSpectator = snapshot.viewMode === 'spectator';
  if (isSpectator) {
    return {
      primaryScore: data?.A?.score ?? null,
      secondaryScore: data?.B?.score ?? null,
      winner: data?.winner || 'draw',
    };
  }

  const role = snapshot.role;
  return {
    primaryScore: role === 'A' ? (data?.A?.score ?? null) : (data?.B?.score ?? null),
    secondaryScore: role === 'A' ? (data?.B?.score ?? null) : (data?.A?.score ?? null),
    winner: data?.winner || 'draw',
  };
}

function getPvpStateChipText(item) {
  if (item.isSuddenDeath) {
    return 'SUDDEN DEATH';
  }
  if (item.status === 'between_rounds') {
    return '回合结算';
  }
  if (item.status === 'in_round') {
    return '进行中';
  }
  return item.status || '观战中';
}

function setPvpOutcome(text) {
  pvpRuntime.outcome = text;
  updatePvpUi();
}

function updatePvpUi() {
  const snapshot = pvpClient.getSnapshot();
  const { room, isSpectator, primaryRole, secondaryRole, primary, secondary } = getPvpDisplayState(snapshot);
  const roomList = Array.isArray(snapshot.roomList) ? snapshot.roomList : [];
  const spectatableRooms = Array.isArray(snapshot.spectatableRooms) ? snapshot.spectatableRooms : [];
  const displayRoomCode = getPvpDisplayRoomCode(snapshot);
  const inPlayerRoom = Boolean(snapshot.roomCode);
  const inSpectatorRoom = snapshot.viewMode === 'spectator' && Boolean(snapshot.watchedRoomCode);

  if (pvpStatus) {
    const statusLabel = snapshot.status === 'connected'
      ? '已连接'
      : snapshot.status === 'connecting'
        ? '连接中...'
        : snapshot.status === 'disconnected'
          ? '已断开'
          : '未连接';
    const extra = snapshot.lastError ? ` · ${snapshot.lastError}` : '';
    pvpStatus.textContent = `${statusLabel}${extra}`;
  }

  if (pvpModeBadge) {
    pvpModeBadge.textContent = isSpectator ? 'SPECTATOR MODE' : 'PLAYER MODE';
  }

  if (pvpRoomLabel) pvpRoomLabel.textContent = displayRoomCode || '--';
  if (pvpRoomCodeInput && snapshot.roomCode) {
    pvpRoomCodeInput.value = snapshot.roomCode;
  }
  if (pvpPlayerYouLabel) pvpPlayerYouLabel.textContent = isSpectator ? 'PLAYER A' : 'YOU';
  if (pvpPlayerOppLabel) pvpPlayerOppLabel.textContent = isSpectator ? 'PLAYER B' : 'OPPONENT';
  if (pvpPlayerYou) pvpPlayerYou.textContent = primary ? `${primary.name}${isSpectator ? '' : ` (${primaryRole || 'YOU'})`}` : '--';
  if (pvpPlayerOpp) pvpPlayerOpp.textContent = secondary ? `${secondary.name}${isSpectator && secondaryRole ? ` (${secondaryRole})` : ''}` : '--';
  if (pvpPlayerYouReady) {
    pvpPlayerYouReady.textContent = isSpectator
      ? (primary ? (primary.connected ? 'ONLINE' : 'OFFLINE') : '--')
      : (primary ? (primary.ready ? 'READY' : 'NOT READY') : '--');
  }
  if (pvpPlayerOppReady) {
    pvpPlayerOppReady.textContent = isSpectator
      ? (!secondary ? 'WAITING' : (secondary.connected ? 'ONLINE' : 'OFFLINE'))
      : (!secondary ? 'WAITING' : (secondary.ready ? 'READY' : 'NOT READY'));
  }
  if (pvpScoreYouLabel) pvpScoreYouLabel.textContent = isSpectator ? 'A 本回合' : '你本回合';
  if (pvpScoreOppLabel) pvpScoreOppLabel.textContent = isSpectator ? 'B 本回合' : '对手本回合';
  if (pvpRoundLabel) pvpRoundLabel.textContent = getPvpRoundHudLabel(pvpRuntime.currentRound);
  if (pvpScoreYou) pvpScoreYou.textContent = pvpRuntime.youScore == null ? '-' : String(pvpRuntime.youScore);
  if (pvpScoreOpp) pvpScoreOpp.textContent = pvpRuntime.oppScore == null ? '-' : String(pvpRuntime.oppScore);
  if (pvpRoundOutcome) pvpRoundOutcome.textContent = pvpRuntime.outcome || '';

  const roomOpen = room?.status === 'lobby';
  const youReady = Boolean(primary?.ready);
  if (btnPvpCreate) btnPvpCreate.disabled = inPlayerRoom || inSpectatorRoom;
  if (btnPvpJoin) btnPvpJoin.disabled = inPlayerRoom || inSpectatorRoom;
  if (btnPvpReady) btnPvpReady.disabled = snapshot.status !== 'connected' || isSpectator || !inPlayerRoom || !roomOpen || youReady;
  if (btnPvpLeave) {
    btnPvpLeave.disabled = snapshot.status !== 'connected' || (!inPlayerRoom && !inSpectatorRoom);
    btnPvpLeave.textContent = isSpectator ? '退出观战' : '离开房间';
  }

  if (pvpRoomListMeta) {
    if (snapshot.status !== 'connected') {
      pvpRoomListMeta.textContent = '连接服务器后显示';
    } else if (roomList.length) {
      pvpRoomListMeta.textContent = `当前 ${roomList.length} 个可加入房间`;
    } else {
      pvpRoomListMeta.textContent = '当前暂无可加入房间';
    }
  }

  if (pvpRoomListEmpty) {
    pvpRoomListEmpty.textContent = snapshot.status === 'connected'
      ? '当前暂无可加入房间，创建一个试试。'
      : '连接服务器后即可查看可加入房间。';
    pvpRoomListEmpty.style.display = roomList.length ? 'none' : 'block';
  }

  if (pvpRoomList) {
    pvpRoomList.innerHTML = '';
    roomList.forEach((item) => {
      const roomCard = document.createElement('button');
      roomCard.type = 'button';
      roomCard.className = 'pvp-room-card';
      roomCard.disabled = snapshot.status !== 'connected' || inPlayerRoom || inSpectatorRoom;
      roomCard.innerHTML = `
        <div class="pvp-room-card-code">${escapeHtml(item.roomCode)}</div>
        <div>${escapeHtml(item.hostName)}</div>
        <div class="pvp-room-card-meta">${escapeHtml(String(item.playerCount))}/${escapeHtml(String(item.maxPlayers))} 人</div>
      `;
      roomCard.addEventListener('click', () => {
        if (roomCard.disabled) {
          return;
        }
        void joinPvpRoomFromLobby(item.roomCode);
      });
      pvpRoomList.appendChild(roomCard);
    });
  }

  if (pvpSpectatorListMeta) {
    if (snapshot.status !== 'connected') {
      pvpSpectatorListMeta.textContent = '连接服务器后显示';
    } else if (spectatableRooms.length) {
      pvpSpectatorListMeta.textContent = `当前 ${spectatableRooms.length} 场可观战比赛`;
    } else {
      pvpSpectatorListMeta.textContent = '当前暂无可观战比赛';
    }
  }

  if (pvpSpectatorListEmpty) {
    pvpSpectatorListEmpty.textContent = snapshot.status === 'connected'
      ? '当前暂无可观战比赛。'
      : '连接服务器后即可查看可观战比赛。';
    pvpSpectatorListEmpty.style.display = spectatableRooms.length ? 'none' : 'block';
  }

  if (pvpSpectatorList) {
    pvpSpectatorList.innerHTML = '';
    spectatableRooms.forEach((item) => {
      const spectatorCard = document.createElement('button');
      spectatorCard.type = 'button';
      spectatorCard.className = 'pvp-spectator-card';
      spectatorCard.disabled = snapshot.status !== 'connected' || inPlayerRoom;
      spectatorCard.innerHTML = `
        <div class="pvp-spectator-head">
          <div class="pvp-spectator-matchup">${escapeHtml(item.playerAName)} VS ${escapeHtml(item.playerBName)}</div>
          <span class="pvp-state-chip">${escapeHtml(getPvpStateChipText(item))}</span>
        </div>
        <div class="pvp-room-card-code">${escapeHtml(item.roomCode)}</div>
        <div class="pvp-room-card-meta">${escapeHtml(getPvpRoundLabel(item.round))} · 胜场 ${escapeHtml(String(item.wins.A))} : ${escapeHtml(String(item.wins.B))}</div>
      `;
      spectatorCard.addEventListener('click', () => {
        if (spectatorCard.disabled) {
          return;
        }
        pvpClient.watchRoom(item.roomCode);
        setPvpOutcome('正在进入观战...');
      });
      pvpSpectatorList.appendChild(spectatorCard);
    });
  }
}

function handlePvpStatus(snapshot) {
  pvpRuntime.status = snapshot.status;
  pvpRuntime.role = snapshot.role;
  pvpRuntime.roomCode = snapshot.roomCode;
  pvpRuntime.viewMode = snapshot.viewMode || 'none';
  pvpRuntime.watchedRoomCode = snapshot.watchedRoomCode || '';
  const isSpectator = snapshot.viewMode === 'spectator';
  const { primary, secondary } = getPvpDisplayState(snapshot);
  if (primary?.name) pvpRuntime.playerName = primary.name;
  if (secondary?.name) pvpRuntime.opponentName = secondary.name;
  if (snapshot.room?.maxRounds) pvpRuntime.maxRounds = snapshot.room.maxRounds;
  if (snapshot.room?.round) pvpRuntime.currentRound = snapshot.room.round;
  if (snapshot.room?.wins) {
    const wins = snapshot.room.wins;
    if (isSpectator) {
      pvpRuntime.winsYou = wins.A ?? 0;
      pvpRuntime.winsOpp = wins.B ?? 0;
    } else if (snapshot.role === 'A') {
      pvpRuntime.winsYou = wins.A ?? 0;
      pvpRuntime.winsOpp = wins.B ?? 0;
    } else if (snapshot.role === 'B') {
      pvpRuntime.winsYou = wins.B ?? 0;
      pvpRuntime.winsOpp = wins.A ?? 0;
    }
  }
  if (Array.isArray(snapshot.room?.results)) {
    pvpRuntime.history = snapshot.room.results.map((item) => {
      const perspective = getPvpRoundPerspective(item, snapshot);
      return {
        round: Number.parseInt(item.round, 10) || 0,
        youScore: perspective.primaryScore ?? 0,
        oppScore: perspective.secondaryScore ?? 0,
        winner: item.winner || 'draw',
      };
    });
  }
  if (snapshot.lastError) pvpRuntime.outcome = snapshot.lastError;
  updatePvpUi();
}

function handlePvpEvent(event) {
  if (!event) return;
  const type = event.type;
  const data = event.data || {};

  if (type === 'joined') {
    resetPvpMatchState('已加入房间，等待开始...');
    if (pvpRoomCodeInput && data?.roomCode) {
      pvpRoomCodeInput.value = String(data.roomCode);
    }
    refreshPvpRoomList();
    refreshPvpSpectatorList();
    return;
  }

  if (type === 'spectatorJoined') {
    resetPvpMatchState('已进入观战，等待比赛推进...');
    pvpRuntime.viewMode = 'spectator';
    pvpRuntime.watchedRoomCode = String(data?.roomCode || '');
    refreshPvpSpectatorList();
    showScreen('pvp');
    updatePvpUi();
    return;
  }

  if (type === 'startRound') {
    const snapshot = pvpClient.getSnapshot();
    const round = Number.parseInt(data.round, 10);
    pvpRuntime.currentRound = Number.isFinite(round) ? round : pvpRuntime.currentRound;
    pvpRuntime.youScore = null;
    pvpRuntime.oppScore = null;
    pvpRuntime.winner = null;
    pvpRuntime.finalResult = null;
    if (isPvpSuddenDeathRound(pvpRuntime.currentRound)) {
      setPvpOutcome(`Sudden Death starts now · 第 ${pvpRuntime.currentRound} 回合`);
    } else {
      setPvpOutcome(`Round ${pvpRuntime.currentRound} 开始，准备出拳`);
    }
    refreshPvpSpectatorList();
    if (snapshot.viewMode === 'spectator') {
      showScreen('pvp');
      return;
    }
    void startCountdown(MODE_PVP);
    return;
  }

  if (type === 'punchAck') {
    setPvpOutcome('已提交出拳，等待对手...');
    punchInstruction.textContent = `已出拳，等待 ${pvpRuntime.opponentName} 回击...`;
    return;
  }

  if (type === 'roundResult') {
    const snapshot = pvpClient.getSnapshot();
    const role = snapshot.role;
    const perspective = getPvpRoundPerspective(data, snapshot);
    const isSpectator = snapshot.viewMode === 'spectator';
    pvpRuntime.youScore = perspective.primaryScore ?? null;
    pvpRuntime.oppScore = perspective.secondaryScore ?? null;
    pvpRuntime.winner = perspective.winner || null;
    if (isSpectator) {
      if (data?.winner === 'A') pvpRuntime.winsYou += 1;
      else if (data?.winner === 'B') pvpRuntime.winsOpp += 1;
    } else if (data?.winner === role) {
      pvpRuntime.winsYou += 1;
    } else if (data?.winner && data.winner !== 'draw') {
      pvpRuntime.winsOpp += 1;
    }

    const roundSummary = {
      round: Number.parseInt(data.round, 10) || pvpRuntime.currentRound,
      youScore: pvpRuntime.youScore ?? 0,
      oppScore: pvpRuntime.oppScore ?? 0,
      winner: data?.winner || 'draw',
    };
    pvpRuntime.history.push(roundSummary);
    if (data?.winner === 'draw') {
      setPvpOutcome(`Round ${roundSummary.round} 平局 · ${roundSummary.youScore} : ${roundSummary.oppScore}`);
    } else if (isSpectator && data?.winner === 'A') {
      setPvpOutcome(`Round ${roundSummary.round} · ${pvpRuntime.playerName} 胜出 · ${roundSummary.youScore} : ${roundSummary.oppScore}`);
    } else if (isSpectator && data?.winner === 'B') {
      setPvpOutcome(`Round ${roundSummary.round} · ${pvpRuntime.opponentName} 胜出 · ${roundSummary.youScore} : ${roundSummary.oppScore}`);
    } else if (data?.winner === role) {
      setPvpOutcome(`Round ${roundSummary.round} 你赢了 · ${roundSummary.youScore} : ${roundSummary.oppScore}`);
    } else {
      setPvpOutcome(`Round ${roundSummary.round} 你输了 · ${roundSummary.youScore} : ${roundSummary.oppScore}`);
    }
    refreshPvpSpectatorList();
    if (isSpectator) {
      showScreen('pvp');
      return;
    }
    void showPvpBattleStatus(roundSummary);
    return;
  }

  if (type === 'matchResult') {
    const snapshot = pvpClient.getSnapshot();
    const role = snapshot.role;
    const isSpectator = snapshot.viewMode === 'spectator';
    const winner = data?.winner || 'draw';
    pvpRuntime.finalResult = data;
    pvpRuntime.winner = winner;
    if (winner === 'draw') setPvpOutcome('比赛结束：平局');
    else if (isSpectator && winner === 'A') setPvpOutcome(`比赛结束：${pvpRuntime.playerName} 获胜`);
    else if (isSpectator && winner === 'B') setPvpOutcome(`比赛结束：${pvpRuntime.opponentName} 获胜`);
    else if (winner === role) setPvpOutcome('比赛结束：你获胜');
    else setPvpOutcome('比赛结束：你落败');
    refreshPvpSpectatorList();
    if (isSpectator) {
      showScreen('pvp');
      return;
    }
    if (!pvpRuntime.isStatusAnimating) {
      showPvpBattleResult();
    }
    return;
  }

  if (type === 'left') {
    resetPvpMatchState('已离开房间');
    if (pvpRoomCodeInput) {
      pvpRoomCodeInput.value = '';
    }
    refreshPvpRoomList();
    refreshPvpSpectatorList();
    updatePvpUi();
    return;
  }

  if (type === 'spectatorLeft') {
    resetPvpMatchState('已退出观战');
    refreshPvpSpectatorList();
    showScreen('pvp');
    updatePvpUi();
    return;
  }

  if (type === 'opponentLeft') {
    resetPvpMatchState('对手已离开房间');
    refreshPvpRoomList();
    refreshPvpSpectatorList();
    showScreen('pvp');
    return;
  }

  if (type === 'matchInterrupted') {
    resetPvpMatchState(data?.message || '比赛中断');
    refreshPvpSpectatorList();
    showScreen('pvp');
    return;
  }

  if (type === 'error') {
    refreshPvpRoomList();
    refreshPvpSpectatorList();
  }
}

async function pvpPrepareAndReady() {
  try {
    const snapshot = await motionController.requestPermission();
    if (snapshot.permissionStatus === 'granted') {
      showScreen('calibrating');
      await motionController.startCalibration();
    }
    showScreen('pvp');
    pvpClient.ready();
    setPvpOutcome('已准备，等待对手...');
  } catch (err) {
    console.error(err);
    alert(`发生错误: ${err.message || String(err)}`);
  }
}

function normalizeScore(rawScore) {
  return Math.max(0, Math.min(SCORE_MAX, Math.round(rawScore ?? 0)));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeChallengeName(rawValue) {
  const normalized = String(rawValue ?? '').trim().replace(/\s+/g, ' ');
  return normalized || DEFAULT_BATTLE_CHALLENGE;
}

function shortenChallengeName(name, maxLength = 10) {
  return name.length > maxLength ? `${name.slice(0, maxLength)}…` : name;
}

function getChallengeTheme(name) {
  const lowerName = name.toLowerCase();
  const themes = [
    {
      keywords: ['presentation', 'present', '汇报', '答辩', '演讲', '路演', 'pre'],
      themeLabel: '表达压力',
      counterAction: '用连环追问和全场注视反扑',
      previewCopy: `系统已将「${name}」识别为表达型焦虑，你这一战是在把台上的紧张感正面打碎。`,
      winCopy: `你把「${name}」狠狠干碎了。站上台时那股发紧的感觉，被你这一拳轰成了底气。`,
      loseCopy: `「${name}」暂时压住了你的节奏，但你已经摸到了它的弱点。再来一拳，把怯场感彻底打飞。`,
      drawCopy: `你和「${name}」僵持到了最后。下一拳，把那些担心忘词和被追问的压力一口气清空。`,
    },
    {
      keywords: ['ddl', 'deadline', '截止', '作业', '论文', '赶工', '项目'],
      themeLabel: '时间追击',
      counterAction: '用红色倒计时和未完成列表反扑',
      previewCopy: `系统已将「${name}」识别为截止日危机，这场对战就是把追着你的时间压力狠狠干回去。`,
      winCopy: `你把「${name}」当场打爆。那些压在头顶的倒计时，现在开始反过来给你让路。`,
      loseCopy: `「${name}」还在追着你跑，但它已经不再不可战胜。下一轮，把拖延和慌乱一起打穿。`,
      drawCopy: `你和「${name}」拼到了最后一秒。补上下一拳，把未完成的焦虑从脑子里清出去。`,
    },
    {
      keywords: ['考试', 'exam', '期末', '测验', '背书', '刷题'],
      themeLabel: '考试压力',
      counterAction: '用分数压力和知识点风暴反扑',
      previewCopy: `系统已将「${name}」识别为考试焦虑，你现在不是在对战机器人，而是在打穿压在心口的成绩压力。`,
      winCopy: `你把「${name}」一拳轰退。那些让人发麻的题海和分数线，终于被你打出了裂缝。`,
      loseCopy: `「${name}」还在持续施压，但它已经不是神话。再来一拳，把“我不行”的声音狠狠干碎。`,
      drawCopy: `你和「${name}」打得难分高下。下一拳，给自己的状态和专注力狠狠干一针强心剂。`,
    },
    {
      keywords: ['面试', 'interview', '实习', 'offer', '求职'],
      themeLabel: '求职压力',
      counterAction: '用沉默、追问和不确定感反扑',
      previewCopy: `系统已将「${name}」识别为求职型压力，这场战斗会把你对未知结果的紧绷感具象化。`,
      winCopy: `你把「${name}」正面打穿。那些关于“会不会失败”的反复内耗，被你一拳打散。`,
      loseCopy: `「${name}」这轮占了上风，但真正的你还没全力出拳。重开一轮，把犹豫和心虚狠狠干掉。`,
      drawCopy: `你和「${name}」打成平局。再补一拳，把自我怀疑打到台下去。`,
    },
    {
      keywords: ['房租', '租房', '账单', '花呗', '穷', '没钱', '余额'],
      themeLabel: '现实账单',
      counterAction: '用账单提醒和余额警报反扑',
      previewCopy: `系统已将「${name}」识别为现实生存压力，这一战就是在把生活里的压迫感狠狠干退。`,
      winCopy: `你把「${name}」狠狠干退。那些压得人喘不过气的提醒和数字，终于被你打出了一点空间。`,
      loseCopy: `「${name}」这次扛住了，但你已经不是被动挨打。再来一拳，把窒息感狠狠干裂。`,
      drawCopy: `你和「${name}」僵住了。下一拳，狠狠干穿那种“被现实追着跑”的闷感。`,
    },
  ];

  return themes.find((theme) => theme.keywords.some((keyword) => lowerName.includes(keyword))) || {
    themeLabel: '现实烦恼',
    counterAction: '用熟悉的压力感突然反扑',
    previewCopy: `系统已锁定你的挑战对象「${name}」。这场战斗会把它包装成可被打倒的现实烦恼。`,
    winCopy: `你把「${name}」狠狠干翻。那些堆在心里的烦躁、紧张和卡顿感，被你一拳一拳清了出去。`,
    loseCopy: `「${name}」暂时扛住了你的重拳，但它已经开始后退。再来一局，把它从今天的情绪里彻底赶出去。`,
    drawCopy: `你和「${name}」打到最后仍未分胜负。下一拳，就把这件烦心事狠狠干出你的生活节奏。`,
  };
}

function getBattleNarrative() {
  const displayName = normalizeChallengeName(appState.battleChallengeName);
  const safeName = escapeHtml(displayName);
  const shortName = shortenChallengeName(displayName, 8);
  const theme = getChallengeTheme(displayName);

  return {
    displayName,
    safeName,
    shortName,
    prepCopyHtml: `你将和「${safeName}」进行三回合对战。<br>每回合你先出拳，把现实压力正面打回去。<br>三轮结束后，让今天的烦恼彻底倒地。`,
    previewCopy: theme.previewCopy,
    prepOpponentLabel: `${shortName} HP`,
    hudRobotLabel: `${shortName} HP`,
    fighterRobotLabel: shortName,
    safetyCopyHtml: `请握紧手机。<br>保持安全距离。<br>听到提示后短幅度挥拳，对「${safeName}」造成伤害。`,
    safetySubcopy: `你先出拳，「${displayName}」会把压力具象成反击。`,
    punchInstruction: `Round ${battleController.getSnapshot().currentRound} · 朝「${displayName}」挥出这一拳！`,
    playerStrikePhase: `你先对「${displayName}」出拳！`,
    robotCounterPhase: `「${displayName}」开始反扑！`,
    statusPhaseDone: `这一轮你和「${displayName}」的交锋结束`,
    statusCopy(roundSummary) {
      return `你的出拳指数：${roundSummary.score}。你对「${displayName}」造成了 ${roundSummary.playerDamage} 点伤害，而「${displayName}」${theme.counterAction}，回敬了 ${roundSummary.robotDamage} 点伤害。`;
    },
    winCopy: theme.winCopy,
    loseCopy: theme.loseCopy,
    drawCopy: theme.drawCopy,
    resultRobotLabel: `${shortName} 剩余 HP`,
  };
}

function refreshBattleChallengeUi() {
  const narrative = getBattleNarrative();

  if (battlePrepCopy) {
    battlePrepCopy.innerHTML = narrative.prepCopyHtml;
  }

  if (battleChallengePreview) {
    battleChallengePreview.textContent = narrative.previewCopy;
  }

  if (battlePrepOpponentLabel) {
    battlePrepOpponentLabel.textContent = narrative.prepOpponentLabel;
  }

  if (battleHudRobotLabel) {
    battleHudRobotLabel.textContent = narrative.hudRobotLabel;
  }

  if (fighterRobotLabel) {
    fighterRobotLabel.textContent = narrative.fighterRobotLabel;
  }

  if (battleChallengeCore) {
    battleChallengeCore.textContent = narrative.shortName.toUpperCase();
  }

  if (battleStatusRobotLabel) {
    battleStatusRobotLabel.textContent = narrative.resultRobotLabel;
  }

  if (battleFinalRobotLabel) {
    battleFinalRobotLabel.textContent = narrative.resultRobotLabel;
  }
}

function syncBattleChallengeFromInput() {
  if (battleChallengeInput) {
    appState.battleChallengeName = normalizeChallengeName(battleChallengeInput.value);
  }

  refreshBattleChallengeUi();
}

function getScoreMeta(score) {
  if (score <= 180) {
    return {
      rating: '轻轻一碰',
      subtitle: '试探新手',
      vibe: '试探级压迫',
      tier: 'C',
    };
  }

  if (score <= 420) {
    return {
      rating: '普通直拳',
      subtitle: '稳定出拳手',
      vibe: '蓄势待发',
      tier: 'B',
    };
  }

  if (score <= 650) {
    return {
      rating: '重拳出击',
      subtitle: '擂台压迫者',
      vibe: '压场成功',
      tier: 'A',
    };
  }

  if (score <= 800) {
    return {
      rating: '爆裂一击',
      subtitle: '校园拳王',
      vibe: '全场沸腾',
      tier: 'S',
    };
  }

  if (score <= 920) {
    return {
      rating: '拳王降临',
      subtitle: '赛博拳王',
      vibe: '高分硬核区',
      tier: 'S',
    };
  }

  return {
    rating: '极限粉碎',
    subtitle: '街机传说',
    vibe: '一拳打穿机器',
    tier: 'SS',
  };
}

function buildPunchResult(rawResult) {
  const score = normalizeScore(rawResult.score);
  const meta = getScoreMeta(score);
  return {
    ...rawResult,
    score,
    damage: Math.max(10, Math.round(score * BATTLE_DAMAGE_SCALE)),
    meta,
  };
}

function updateBattleHud() {
  const snapshot = battleController.getSnapshot();
  battleHud.style.display = appState.activePunchContext === MODE_BATTLE ? 'block' : 'none';
  if (battlePlayerLabel) battlePlayerLabel.textContent = 'PLAYER HP';
  if (battleRoundLabel) battleRoundLabel.textContent = 'ROUND';
  battleRound.textContent = `${snapshot.currentRound} / ${snapshot.maxRounds}`;
  battlePlayerHp.textContent = String(snapshot.playerHp);
  battleRobotHp.textContent = String(snapshot.robotHp);
  refreshBattleChallengeUi();
}

function updatePvpBattleHud() {
  battleHud.style.display = 'block';
  if (battlePlayerLabel) battlePlayerLabel.textContent = '你的胜场';
  if (battleRoundLabel) battleRoundLabel.textContent = 'PVP ROUND';
  if (battleHudRobotLabel) battleHudRobotLabel.textContent = `${pvpRuntime.opponentName} 胜场`;
  battleRound.textContent = getPvpRoundHudLabel(pvpRuntime.currentRound);
  battlePlayerHp.textContent = String(pvpRuntime.winsYou);
  battleRobotHp.textContent = String(pvpRuntime.winsOpp);
}

function configureSafetyScreen() {
  if (appState.selectedMode === MODE_BATTLE) {
    const snapshot = battleController.getSnapshot();
    const narrative = getBattleNarrative();
    safetyTitle.textContent = `模式二：人机对战 · Round ${snapshot.currentRound}`;
    safetyCopy.innerHTML = narrative.safetyCopyHtml;
    safetySubcopy.textContent = narrative.safetySubcopy;
    return;
  }

  safetyTitle.textContent = '模式一：出拳力度测试';
  safetyCopy.innerHTML = '请握紧手机。<br>保持正前方。<br>听到提示后短幅度挥拳。';
  safetySubcopy.textContent = '目标是在 10 秒内理解玩法并稳定打出一拳。';
}

function playResultOutcome(result) {
  window.setTimeout(() => {
    if (result.score >= 720) {
      feedbackModule.victory();
      return;
    }

    feedbackModule.defeat();
  }, 110);
}

function animateImpact(score) {
  appContainer.classList.remove('screen-shake');
  void appContainer.offsetWidth;
  appContainer.classList.add('screen-shake');

  if (bagResult) {
    window.setTimeout(() => {
      feedbackModule.hit(score);
    }, 40);
  } else {
    feedbackModule.hit(score);
  }
}

async function proceedFromSafety() {
  try {
    const snapshot = await motionController.requestPermission();
    if (snapshot.permissionStatus === 'granted') {
      showScreen('calibrating');
      await motionController.startCalibration();
    }

    await startCountdown(appState.selectedMode);
  } catch (err) {
    console.error(err);
    alert(`发生错误: ${err.message || String(err)}`);
  }
}

async function startCountdown(context) {
  appState.activePunchContext = context;
  showScreen('countdown');
  setCountdownDisplay('3');
  countdownContext.textContent = context === MODE_BATTLE
    ? `模式二 · Round ${battleController.getSnapshot().currentRound}`
    : context === MODE_PVP
      ? `模式三 · ${getPvpRoundLabel(pvpRuntime.currentRound || 1)}`
      : '模式一：出拳测试';

  for (let i = 3; i > 0; i -= 1) {
    setCountdownDisplay(String(i));
    feedbackModule.countdownTick();
    feedbackModule.softPulse();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  setCountdownDisplay('PUNCH!', { isPunchCue: true });
  feedbackModule.countdownTick();
  await new Promise((resolve) => setTimeout(resolve, COUNTDOWN_PUNCH_CUE_MS));
  await startPunch(context);
}

async function startPunch(context) {
  appState.activePunchContext = context;
  showScreen('punch');
  motionPunchCuePlayed = false;

  const motionSnapshot = motionController.getSnapshot();
  if (bagPunch) {
    bagPunch.style.transform = 'scale(1) rotate(0deg)';
    bagPunch.style.transition = 'none';
  }

  if (punchStage) {
    punchStage.classList.remove('is-cueing');
    void punchStage.offsetWidth;
    punchStage.classList.add('is-cueing');
  }

  if (context === MODE_BATTLE) {
    const narrative = getBattleNarrative();
    punchInstruction.textContent = narrative.punchInstruction;
    updateBattleHud();
  } else if (context === MODE_PVP) {
    punchInstruction.textContent = `${getPvpRoundLabel(pvpRuntime.currentRound || 1)} · 对战 ${pvpRuntime.opponentName}`;
    updatePvpBattleHud();
  } else {
    punchInstruction.textContent = '挥动手机，击打沙包！';
    battleHud.style.display = 'none';
  }

  if (motionSnapshot.mode === 'motion') {
    motionUi.style.display = 'block';
    fallbackUi.style.display = 'none';

    try {
      const result = await motionController.startPunchTest();
      handlePunchResult(result);
    } catch (err) {
      console.error(err);
      alert(`挥拳测试失败: ${err.message || String(err)}`);
    }
    return;
  }

  motionUi.style.display = 'none';
  fallbackUi.style.display = 'block';
  chargeFill.style.width = '0%';
}

function showModeOneResult(rawResult) {
  const result = buildPunchResult(rawResult);
  const meta = result.meta;
  showScreen('result');
  feedbackModule.scorePulse(result.score);
  animateImpact(result.score);

  resultTitle.textContent = meta.rating;
  resScore.textContent = String(result.score);
  resDamage.textContent = String(result.damage);
  resRating.textContent = meta.rating;
  resTitle.textContent = meta.subtitle;
  resCopy.textContent = meta.vibe;
  resTier.textContent = meta.tier;
  resMeterLabel.textContent = `${result.score} / ${SCORE_MAX}`;
  resMeterFill.style.width = `${(result.score / SCORE_MAX) * 100}%`;
  resTier.className = `result-rank-tier is-${String(meta.tier).toLowerCase()}`;
  resMeterFill.className = `result-meter-fill is-${String(meta.tier).toLowerCase()}`;

  if (result.score >= 900) {
    resDamage.style.color = 'var(--accent-good)';
    resRating.style.color = 'var(--accent-good)';
  } else if (result.score >= 700) {
    resDamage.style.color = 'var(--accent-alt)';
    resRating.style.color = 'var(--accent-alt)';
  } else {
    resDamage.style.color = 'var(--accent)';
    resRating.style.color = '#fff';
  }

  playResultOutcome(result);
}

function resetBattlePlaybackUi() {
  [battleArena, fighterPlayer, fighterRobot, battlePopupPlayer, battlePopupRobot, battleChallengeCore].forEach((element) => {
    if (!element) {
      return;
    }
    element.classList.remove(
      'is-impact',
      'is-finish-impact',
      'is-player-strike',
      'is-robot-strike',
      'is-attacking',
      'is-countering',
      'is-hit',
      'is-active',
      'is-shattering',
    );
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function playBattleStatusAnimation(snapshot) {
  const { roundSummary, battleFinished, winner } = snapshot;
  const narrative = getBattleNarrative();
  resetBattlePlaybackUi();
  battlePopupRobot.textContent = `-${roundSummary.playerDamage}`;
  battlePopupPlayer.textContent = `-${roundSummary.robotDamage}`;

  battleStatusPhase.textContent = narrative.playerStrikePhase;
  battleArena.classList.add('is-player-strike');
  fighterPlayer.classList.add('is-attacking');
  await wait(BATTLE_TIMINGS.playerWindup);
  battleArena.classList.add('is-impact');
  fighterRobot.classList.add('is-hit');
  battlePopupRobot.classList.add('is-active');
  feedbackModule.hit(roundSummary.score);
  await wait(BATTLE_TIMINGS.playerImpactHold);

  if (battleFinished && winner === 'win') {
    resetBattlePlaybackUi();
    battleStatusPhase.textContent = `终结一击！「${narrative.displayName}」正在被粉碎`;
    battleArena.classList.add('is-finish-impact');
    fighterRobot.classList.add('is-hit');
    fighterRobot.classList.add('is-shattering');
    if (battleChallengeCore) {
      battleChallengeCore.classList.add('is-shattering');
    }
    feedbackModule.victory();
    await wait(980);
    return;
  }

  resetBattlePlaybackUi();
  battleStatusPhase.textContent = narrative.robotCounterPhase;
  battleArena.classList.add('is-robot-strike');
  fighterRobot.classList.add('is-countering');
  await wait(BATTLE_TIMINGS.robotWindup);
  battleArena.classList.add('is-impact');
  fighterPlayer.classList.add('is-hit');
  battlePopupPlayer.classList.add('is-active');
  feedbackModule.defeat();
  await wait(BATTLE_TIMINGS.robotImpactHold);

  resetBattlePlaybackUi();
  if (battleFinished) {
    battleStatusPhase.textContent = winner === 'lose'
      ? `「${narrative.displayName}」压住了你的节奏，正在结算结果...`
      : `你和「${narrative.displayName}」打满全场，正在结算结果...`;
    return;
  }

  battleStatusPhase.textContent = narrative.statusPhaseDone;
}

async function showBattleStatus(snapshot) {
  const { roundSummary, battleFinished } = snapshot;
  const autoAdvanceToken = ++appState.battleAutoAdvanceToken;
  const narrative = getBattleNarrative();
  if (battleStatusPlayerLabel) battleStatusPlayerLabel.textContent = '你的剩余 HP';
  if (battleStatusRobotLabel) battleStatusRobotLabel.textContent = narrative.resultRobotLabel;
  battleStatusTitle.textContent = `Round ${roundSummary.round} 结束`;
  battleStatusCopy.textContent = battleFinished && snapshot.winner === 'win'
    ? `你的出拳指数：${roundSummary.score}。你对「${narrative.displayName}」造成了 ${roundSummary.playerDamage} 点终结伤害，这一拳直接把它的防线打到粉碎。`
    : narrative.statusCopy(roundSummary);
  battleStatusPlayerHp.textContent = String(roundSummary.playerHp);
  battleStatusRobotHp.textContent = String(roundSummary.robotHp);
  btnBattleNext.disabled = true;
  btnBattleNext.style.display = 'none';
  showScreen('battleStatus');
  await playBattleStatusAnimation(snapshot);

  if (autoAdvanceToken !== appState.battleAutoAdvanceToken) {
    return;
  }

  if (battleFinished) {
    battleStatusPhase.textContent = winnerMessageForAutoResult(snapshot, narrative.displayName);
    await wait(720);

    if (autoAdvanceToken !== appState.battleAutoAdvanceToken) {
      return;
    }

    showBattleResult(snapshot);
    return;
  }

  battleStatusPhase.textContent = `Round ${snapshot.currentRound} 即将开始...`;
  await wait(BATTLE_TIMINGS.nextRoundBuffer);

  if (autoAdvanceToken !== appState.battleAutoAdvanceToken) {
    return;
  }

  await proceedBattleRound();
}

function showBattleResult(snapshot) {
  const narrative = getBattleNarrative();
  const winnerMap = {
    win: {
      title: 'Win!',
      kicker: 'FINISHER',
      copy: narrative.winCopy,
      defeatedLabel: `「${narrative.displayName}」已粉碎`,
    },
    lose: {
      title: 'Lose!',
      kicker: 'SYSTEM REPLAY',
      copy: narrative.loseCopy,
      defeatedLabel: `「${narrative.displayName}」本回合占优`,
    },
    draw: {
      title: 'Draw!',
      kicker: 'LAST EXCHANGE',
      copy: narrative.drawCopy,
      defeatedLabel: `你与「${narrative.displayName}」僵持收场`,
    },
  };

  const winnerCopy = winnerMap[snapshot.winner] || winnerMap.draw;
  if (battleResultScreen) {
    battleResultScreen.classList.remove('is-revealing', 'is-win', 'is-lose', 'is-draw');
    void battleResultScreen.offsetWidth;
    battleResultScreen.classList.add('is-revealing', `is-${snapshot.winner || 'draw'}`);
  }

  if (snapshot.winner === 'lose') {
    feedbackModule.defeat();
  } else if (snapshot.winner === 'draw') {
    feedbackModule.softPulse();
  }

  if (battleResultKicker) {
    battleResultKicker.textContent = winnerCopy.kicker;
  }
  if (battleFinalPlayerLabel) battleFinalPlayerLabel.textContent = '玩家剩余 HP';
  if (battleFinalRobotLabel) battleFinalRobotLabel.textContent = narrative.resultRobotLabel;
  battleResultTitle.textContent = winnerCopy.title;
  if (battleResultDefeated) {
    battleResultDefeated.textContent = winnerCopy.defeatedLabel;
  }
  battleResultCopy.textContent = winnerCopy.copy;
  battleFinalPlayerHp.textContent = String(snapshot.playerHp);
  battleFinalRobotHp.textContent = String(snapshot.robotHp);
  battleFinalDamage.textContent = String(snapshot.totalDamage);
  battleFinalScore.textContent = String(snapshot.highestScore);
  showScreen('battleResult');
}

function winnerMessageForAutoResult(snapshot, displayName) {
  if (snapshot.winner === 'win') {
    return `「${displayName}」已被彻底击碎，战斗结果正在展开...`;
  }

  if (snapshot.winner === 'lose') {
    return `「${displayName}」暂时赢下这一场，战斗结果正在展开...`;
  }

  return `你和「${displayName}」势均力敌，战斗结果正在展开...`;
}

function getPvpWinnerText(winner) {
  if (winner === 'draw') return '这一回合平分秋色';
  if (winner === pvpRuntime.role) return `你在 ${getPvpRoundLabel(pvpRuntime.currentRound)} 压住了 ${pvpRuntime.opponentName}`;
  return `${pvpRuntime.opponentName} 在这一回合占了上风`;
}

async function playPvpStatusAnimation(roundSummary) {
  resetBattlePlaybackUi();
  battlePopupRobot.textContent = `${roundSummary.youScore}`;
  battlePopupPlayer.textContent = `${roundSummary.oppScore}`;

  battleStatusPhase.textContent = `你先出拳，压制 ${pvpRuntime.opponentName}`;
  battleArena.classList.add('is-player-strike');
  fighterPlayer.classList.add('is-attacking');
  await wait(180);
  battleArena.classList.add('is-impact');
  fighterRobot.classList.add('is-hit');
  battlePopupRobot.classList.add('is-active');
  feedbackModule.hit(roundSummary.youScore);
  await wait(560);

  resetBattlePlaybackUi();
  battleStatusPhase.textContent = `${pvpRuntime.opponentName} 发起反击`;
  battleArena.classList.add('is-robot-strike');
  fighterRobot.classList.add('is-countering');
  await wait(180);
  battleArena.classList.add('is-impact');
  fighterPlayer.classList.add('is-hit');
  battlePopupPlayer.classList.add('is-active');
  if (roundSummary.winner === pvpRuntime.role) feedbackModule.victory();
  else if (roundSummary.winner === 'draw') feedbackModule.softPulse();
  else feedbackModule.defeat();
  await wait(620);

  resetBattlePlaybackUi();
  battleStatusPhase.textContent = getPvpWinnerText(roundSummary.winner);
}

async function showPvpBattleStatus(roundSummary) {
  const autoAdvanceToken = ++appState.battleAutoAdvanceToken;
  pvpRuntime.isStatusAnimating = true;
  if (fighterRobotLabel) fighterRobotLabel.textContent = pvpRuntime.opponentName;
  if (battleStatusPlayerLabel) battleStatusPlayerLabel.textContent = '你的胜场';
  if (battleStatusRobotLabel) battleStatusRobotLabel.textContent = `${pvpRuntime.opponentName} 胜场`;
  battleStatusTitle.textContent = `${getPvpRoundLabel(roundSummary.round)} 结束`;
  battleStatusCopy.textContent = `${isPvpSuddenDeathRound(roundSummary.round) ? '加时赛 · ' : ''}你的出拳指数 ${roundSummary.youScore}，${pvpRuntime.opponentName} 的出拳指数 ${roundSummary.oppScore}。当前大比分 ${pvpRuntime.winsYou} : ${pvpRuntime.winsOpp}。`;
  battleStatusPlayerHp.textContent = String(pvpRuntime.winsYou);
  battleStatusRobotHp.textContent = String(pvpRuntime.winsOpp);
  btnBattleNext.textContent = '正在同步...';
  btnBattleNext.disabled = true;
  btnBattleNext.style.display = 'none';
  showScreen('battleStatus');
  await playPvpStatusAnimation(roundSummary);

  if (autoAdvanceToken !== appState.battleAutoAdvanceToken) {
    pvpRuntime.isStatusAnimating = false;
    return;
  }

  await wait(PVP_STATUS_READ_MS);

  if (autoAdvanceToken !== appState.battleAutoAdvanceToken) {
    pvpRuntime.isStatusAnimating = false;
    return;
  }

  pvpRuntime.isStatusAnimating = false;
  if (pvpRuntime.finalResult) {
    showPvpBattleResult();
    return;
  }

  battleStatusPhase.textContent = isPvpSuddenDeathRound(roundSummary.round + 1)
    ? `Sudden Death 即将继续，等待 ${pvpRuntime.opponentName} 的下一回合同步...`
    : `等待 ${pvpRuntime.opponentName} 的下一回合同步...`;
}

function showPvpBattleResult() {
  const finalResult = pvpRuntime.finalResult;
  if (!finalResult) return;
  const wentToSuddenDeath = pvpRuntime.history.some((item) => item.round > pvpRuntime.maxRounds);
  const overtimeText = wentToSuddenDeath ? '经过 Sudden Death 后，' : '';

  if (battleResultScreen) {
    battleResultScreen.classList.remove('is-revealing', 'is-win', 'is-lose', 'is-draw');
    void battleResultScreen.offsetWidth;
    const stateClass = finalResult.winner === 'draw' ? 'draw' : (finalResult.winner === pvpRuntime.role ? 'win' : 'lose');
    battleResultScreen.classList.add('is-revealing', `is-${stateClass}`);
  }

  if (battleResultKicker) {
    battleResultKicker.textContent = wentToSuddenDeath ? 'PVP OVERTIME' : 'PVP SHOWDOWN';
  }
  if (battleResultDefeated) {
    battleResultDefeated.textContent = wentToSuddenDeath
      ? `${pvpRuntime.playerName} VS ${pvpRuntime.opponentName} · SUDDEN DEATH`
      : `${pvpRuntime.playerName} VS ${pvpRuntime.opponentName}`;
  }
  if (battleFinalPlayerLabel) battleFinalPlayerLabel.textContent = '你的胜场';
  if (battleFinalRobotLabel) battleFinalRobotLabel.textContent = `${pvpRuntime.opponentName} 胜场`;

  const winner = finalResult.winner;
  if (winner === 'draw') {
    battleResultTitle.textContent = 'Draw!';
    battleResultCopy.textContent = `你和 ${pvpRuntime.opponentName}${overtimeText}仍然战成平手。`;
    feedbackModule.softPulse();
  } else if (winner === pvpRuntime.role) {
    battleResultTitle.textContent = 'Win!';
    battleResultCopy.textContent = `你${overtimeText}击败了 ${pvpRuntime.opponentName}，这场 PVP 对决已经被你拿下。`;
    feedbackModule.victory();
  } else {
    battleResultTitle.textContent = 'Lose!';
    battleResultCopy.textContent = `${pvpRuntime.opponentName}${overtimeText}拿下了这场 PVP，对方的节奏更稳，但你已经把对局打热了。`;
    feedbackModule.defeat();
  }

  battleFinalPlayerHp.textContent = String(pvpRuntime.winsYou);
  battleFinalRobotHp.textContent = String(pvpRuntime.winsOpp);
  battleFinalDamage.textContent = String(pvpRuntime.history.reduce((sum, item) => sum + item.youScore, 0));
  battleFinalScore.textContent = String(Math.max(0, ...pvpRuntime.history.map((item) => item.youScore)));
  showScreen('battleResult');
}

async function handleBattlePunch(rawResult) {
  const result = buildPunchResult(rawResult);
  const snapshot = battleController.resolveRound(result);
  feedbackModule.scorePulse(result.score);
  animateImpact(result.score);
  await wait(BATTLE_TIMINGS.postPunchTransition);
  await showBattleStatus(snapshot);
}

function handlePvpPunch(rawResult) {
  const snapshot = pvpClient.getSnapshot();
  if (!snapshot.roomCode || !pvpRuntime.currentRound) {
    setPvpOutcome('回合尚未开始或未加入房间');
    showScreen('pvp');
    return;
  }

  const result = buildPunchResult(rawResult);
  pvpRuntime.youScore = result.score;
  feedbackModule.scorePulse(result.score);
  animateImpact(result.score);
  pvpClient.sendPunch({
    round: pvpRuntime.currentRound,
    score: result.score,
    peakDelta: rawResult?.peakDelta ?? null,
    source: rawResult?.source ?? '',
  });
  setPvpOutcome(`已出拳：${result.score}，等待对手...`);
  punchInstruction.textContent = `已出拳 ${result.score} · 等待 ${pvpRuntime.opponentName} 回击`;
}

function handlePunchResult(rawResult) {
  motionController.resetResult();
  pointerActive = false;

  if (appState.activePunchContext === MODE_PVP) {
    handlePvpPunch(rawResult);
    return;
  }

  if (appState.activePunchContext === MODE_BATTLE) {
    void handleBattlePunch(rawResult);
    return;
  }

  showModeOneResult(rawResult);
}

function startModeOne() {
  motionController.resetResult();
  appState.selectedMode = MODE_TEST;
  appState.activePunchContext = MODE_TEST;
  configureSafetyScreen();
  showScreen('safety');
}

function openBattlePrep() {
  motionController.resetResult();
  appState.selectedMode = MODE_BATTLE;
  syncBattleChallengeFromInput();
  showScreen('battlePrep');
}

function startBattleFlow() {
  motionController.resetResult();
  syncBattleChallengeFromInput();
  battleController.startBattle();
  appState.selectedMode = MODE_BATTLE;
  appState.activePunchContext = MODE_BATTLE;
  appState.battleAutoAdvanceToken += 1;
  configureSafetyScreen();
  showScreen('safety');
}

async function proceedBattleRound() {
  await startCountdown(MODE_BATTLE);
}

feedbackModule.installUnlockListeners(document);
document.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('button')) {
    feedbackModule.tap();
    const accentButton = target.closest('.accent-button');
    if (accentButton instanceof HTMLElement) {
      triggerButtonPunchPop(accentButton);
    }
  }
}, true);

btnModeTest.addEventListener('click', () => {
  runAfterButtonPunchPop(btnModeTest, startModeOne);
});
btnModeBattle.addEventListener('click', () => {
  runAfterButtonPunchPop(btnModeBattle, openBattlePrep);
});
btnModePvp.addEventListener('click', () => {
  runAfterButtonPunchPop(btnModePvp, openPvp);
});
btnPvpHome.addEventListener('click', goHome);

if (btnPvpCreate) {
  btnPvpCreate.addEventListener('click', async () => {
    const ok = await ensurePvpConnected();
    if (!ok) {
      setPvpOutcome('无法连接服务器');
      return;
    }
    pvpClient.createRoom(getPvpInputName());
    setPvpOutcome('已创建房间，等待对手加入...');
    refreshPvpRoomList();
    refreshPvpSpectatorList();
  });
}

if (btnPvpJoin) {
  btnPvpJoin.addEventListener('click', () => {
    void joinPvpRoomFromLobby(getPvpInputRoomCode());
  });
}

if (btnPvpReady) {
  btnPvpReady.addEventListener('click', () => {
    void pvpPrepareAndReady();
  });
}

if (btnPvpLeave) {
  btnPvpLeave.addEventListener('click', () => {
    const snapshot = pvpClient.getSnapshot();
    if (snapshot.viewMode === 'spectator') {
      pvpClient.leaveSpectator();
    } else {
      pvpClient.leave();
    }
    refreshPvpRoomList();
    refreshPvpSpectatorList();
  });
}

btnSafetyOk.addEventListener('click', proceedFromSafety);
btnSafetyHome.addEventListener('click', goHome);

btnResultRetry.addEventListener('click', startModeOne);
btnResultBattle.addEventListener('click', openBattlePrep);
btnResultHome.addEventListener('click', goHome);

btnBattleStart.addEventListener('click', startBattleFlow);
btnBattlePrepHome.addEventListener('click', goHome);
btnBattleNext.addEventListener('click', () => {
  if (appState.selectedMode === MODE_PVP) {
    if (pvpRuntime.finalResult) {
      showPvpBattleResult();
    }
    return;
  }
  const snapshot = battleController.getSnapshot();
  if (snapshot.status !== 'finished') {
    proceedBattleRound();
  }
});
btnBattleStatusHome.addEventListener('click', goHome);
btnBattleRestart.addEventListener('click', () => {
  if (appState.selectedMode === MODE_PVP) {
    openPvp();
    return;
  }
  startBattleFlow();
});
btnBattleResultHome.addEventListener('click', goHome);

if (battleChallengeInput) {
  battleChallengeInput.addEventListener('input', syncBattleChallengeFromInput);
}

if (fallbackBtn) {
  fallbackBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pointerActive = true;
    motionController.startCharge();
    feedbackModule.softPulse();
  });
}

const endCharge = (event) => {
  if (!pointerActive) {
    return;
  }

  pointerActive = false;
  if (event) {
    event.preventDefault();
  }

  const result = motionController.stopCharge();
  if (result) {
    feedbackModule.punch();
    handlePunchResult(result);
  }
};

if (fallbackBtn) {
  fallbackBtn.addEventListener('pointerup', endCharge);
  fallbackBtn.addEventListener('pointercancel', endCharge);
  fallbackBtn.addEventListener('pointerleave', endCharge);
}

window.addEventListener('pointerup', endCharge);
refreshBattleChallengeUi();
updatePvpUi();
showScreen('home');
