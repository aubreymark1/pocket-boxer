import { createMotionController } from './motion.js';
import { feedbackModule } from './feedback.js';
import { createBattleController } from './battle.js';

const MODE_TEST = 'test';
const MODE_BATTLE = 'battle';
const DEFAULT_BATTLE_CHALLENGE = '拳击机器人';

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
const bagResult = document.getElementById('bag-result');

const battleHud = document.getElementById('battle-hud');
const battleRound = document.getElementById('battle-round');
const battlePlayerHp = document.getElementById('battle-player-hp');
const battleRobotHp = document.getElementById('battle-robot-hp');
const battleStatusTitle = document.getElementById('battle-status-title');
const battleStatusPhase = document.getElementById('battle-status-phase');
const battleStatusCopy = document.getElementById('battle-status-copy');
const battleStatusPlayerHp = document.getElementById('battle-status-player-hp');
const battleStatusRobotHp = document.getElementById('battle-status-robot-hp');
const battleArena = document.getElementById('battle-arena');
const fighterPlayer = document.getElementById('fighter-player');
const fighterRobot = document.getElementById('fighter-robot');
const battlePopupPlayer = document.getElementById('battle-popup-player');
const battlePopupRobot = document.getElementById('battle-popup-robot');
const battleResultTitle = document.getElementById('battle-result-title');
const battleResultCopy = document.getElementById('battle-result-copy');
const battleFinalPlayerHp = document.getElementById('battle-final-player-hp');
const battleFinalRobotHp = document.getElementById('battle-final-robot-hp');
const battleFinalDamage = document.getElementById('battle-final-damage');
const battleFinalScore = document.getElementById('battle-final-score');

const bagPunch = document.getElementById('bag-punch');
let motionPunchCuePlayed = false;
let pointerActive = false;

const appState = {
  selectedMode: MODE_TEST,
  activePunchContext: MODE_TEST,
  battleAutoAdvanceToken: 0,
  battleChallengeName: DEFAULT_BATTLE_CHALLENGE,
};

const battleController = createBattleController();

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

      if (!motionPunchCuePlayed && delta > 5) {
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

function goHome() {
  motionController.resetResult();
  pointerActive = false;
  appState.selectedMode = MODE_TEST;
  appState.activePunchContext = MODE_TEST;
  appState.battleAutoAdvanceToken += 1;
  battleHud.style.display = 'none';
  showScreen('home');
}

function normalizeScore(rawScore) {
  return Math.max(0, Math.min(100, Math.round(rawScore ?? 0)));
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
  if (score <= 30) {
    return {
      rating: '轻轻一碰',
      subtitle: '试探新手',
      comment: '这一拳像是在拍蚊子',
    };
  }

  if (score <= 50) {
    return {
      rating: '普通直拳',
      subtitle: '稳定出拳手',
      comment: '有点力量，但还不够狠',
    };
  }

  if (score <= 70) {
    return {
      rating: '重拳出击',
      subtitle: '擂台压迫者',
      comment: '这一拳已经有压迫感了',
    };
  }

  if (score <= 90) {
    return {
      rating: '爆裂一击',
      subtitle: '校园拳王',
      comment: '机器人开始后退',
    };
  }

  return {
    rating: '拳王降临',
    subtitle: '赛博拳王',
    comment: '这一拳打穿了空气',
  };
}

function buildPunchResult(rawResult) {
  const score = normalizeScore(rawResult.score);
  const meta = getScoreMeta(score);
  return {
    ...rawResult,
    score,
    damage: Math.max(1, Math.round(score * 0.5)),
    meta,
  };
}

function updateBattleHud() {
  const snapshot = battleController.getSnapshot();
  battleHud.style.display = appState.activePunchContext === MODE_BATTLE ? 'block' : 'none';
  battleRound.textContent = `${snapshot.currentRound} / ${snapshot.maxRounds}`;
  battlePlayerHp.textContent = String(snapshot.playerHp);
  battleRobotHp.textContent = String(snapshot.robotHp);
  refreshBattleChallengeUi();
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
    if (result.score >= 71) {
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
  countdownContext.textContent = context === MODE_BATTLE
    ? `模式二 · Round ${battleController.getSnapshot().currentRound}`
    : '模式一：出拳测试';

  for (let i = 3; i > 0; i -= 1) {
    countdownDisplay.textContent = i;
    feedbackModule.countdownTick();
    feedbackModule.softPulse();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  countdownDisplay.textContent = 'PUNCH!';
  feedbackModule.countdownTick();
  await new Promise((resolve) => setTimeout(resolve, 450));
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

  if (context === MODE_BATTLE) {
    const narrative = getBattleNarrative();
    punchInstruction.textContent = narrative.punchInstruction;
    updateBattleHud();
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
  resCopy.textContent = meta.comment;

  if (result.score >= 91) {
    resDamage.style.color = 'var(--accent-good)';
    resRating.style.color = 'var(--accent-good)';
  } else if (result.score >= 71) {
    resDamage.style.color = 'var(--accent-alt)';
    resRating.style.color = 'var(--accent-alt)';
  } else {
    resDamage.style.color = 'var(--accent)';
    resRating.style.color = '#fff';
  }

  playResultOutcome(result);
}

function resetBattlePlaybackUi() {
  [battleArena, fighterPlayer, fighterRobot, battlePopupPlayer, battlePopupRobot].forEach((element) => {
    if (!element) {
      return;
    }
    element.classList.remove(
      'is-impact',
      'is-player-strike',
      'is-robot-strike',
      'is-attacking',
      'is-countering',
      'is-hit',
      'is-active',
    );
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function playBattleStatusAnimation(roundSummary) {
  const narrative = getBattleNarrative();
  resetBattlePlaybackUi();
  battlePopupRobot.textContent = `-${roundSummary.playerDamage}`;
  battlePopupPlayer.textContent = `-${roundSummary.robotDamage}`;

  battleStatusPhase.textContent = narrative.playerStrikePhase;
  battleArena.classList.add('is-player-strike');
  fighterPlayer.classList.add('is-attacking');
  await wait(180);
  battleArena.classList.add('is-impact');
  fighterRobot.classList.add('is-hit');
  battlePopupRobot.classList.add('is-active');
  feedbackModule.hit(roundSummary.score);
  await wait(560);

  resetBattlePlaybackUi();
  battleStatusPhase.textContent = narrative.robotCounterPhase;
  battleArena.classList.add('is-robot-strike');
  fighterRobot.classList.add('is-countering');
  await wait(180);
  battleArena.classList.add('is-impact');
  fighterPlayer.classList.add('is-hit');
  battlePopupPlayer.classList.add('is-active');
  feedbackModule.defeat();
  await wait(620);

  resetBattlePlaybackUi();
  battleStatusPhase.textContent = narrative.statusPhaseDone;
}

async function showBattleStatus(snapshot) {
  const { roundSummary, battleFinished } = snapshot;
  const autoAdvanceToken = ++appState.battleAutoAdvanceToken;
  const narrative = getBattleNarrative();
  battleStatusTitle.textContent = `Round ${roundSummary.round} 结束`;
  battleStatusCopy.textContent = narrative.statusCopy(roundSummary);
  battleStatusPlayerHp.textContent = String(roundSummary.playerHp);
  battleStatusRobotHp.textContent = String(roundSummary.robotHp);
  btnBattleNext.textContent = battleFinished ? '查看战斗结果' : `进入 Round ${snapshot.currentRound}`;
  btnBattleNext.disabled = true;
  btnBattleNext.style.display = battleFinished ? 'block' : 'none';
  showScreen('battleStatus');
  await playBattleStatusAnimation(roundSummary);

  if (autoAdvanceToken !== appState.battleAutoAdvanceToken) {
    return;
  }

  if (battleFinished) {
    battleStatusPhase.textContent = `「${narrative.displayName}」挑战结束，查看结果`;
    btnBattleNext.disabled = false;
    return;
  }

  battleStatusPhase.textContent = `Round ${snapshot.currentRound} 即将开始...`;
  await wait(700);

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
      copy: narrative.winCopy,
    },
    lose: {
      title: 'Lose!',
      copy: narrative.loseCopy,
    },
    draw: {
      title: 'Draw!',
      copy: narrative.drawCopy,
    },
  };

  const winnerCopy = winnerMap[snapshot.winner] || winnerMap.draw;
  battleResultTitle.textContent = winnerCopy.title;
  battleResultCopy.textContent = winnerCopy.copy;
  battleFinalPlayerHp.textContent = String(snapshot.playerHp);
  battleFinalRobotHp.textContent = String(snapshot.robotHp);
  battleFinalDamage.textContent = String(snapshot.totalDamage);
  battleFinalScore.textContent = String(snapshot.highestScore);
  showScreen('battleResult');
}

function handleBattlePunch(rawResult) {
  const result = buildPunchResult(rawResult);
  const snapshot = battleController.resolveRound(result);
  feedbackModule.scorePulse(result.score);
  animateImpact(result.score);

  void showBattleStatus(snapshot);
}

function handlePunchResult(rawResult) {
  motionController.resetResult();
  pointerActive = false;

  if (appState.activePunchContext === MODE_BATTLE) {
    handleBattlePunch(rawResult);
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
  }
}, true);

btnModeTest.addEventListener('click', startModeOne);
btnModeBattle.addEventListener('click', openBattlePrep);
btnModePvp.addEventListener('click', () => showScreen('pvp'));
btnPvpHome.addEventListener('click', goHome);

btnSafetyOk.addEventListener('click', proceedFromSafety);
btnSafetyHome.addEventListener('click', goHome);

btnResultRetry.addEventListener('click', startModeOne);
btnResultBattle.addEventListener('click', openBattlePrep);
btnResultHome.addEventListener('click', goHome);

btnBattleStart.addEventListener('click', startBattleFlow);
btnBattlePrepHome.addEventListener('click', goHome);
btnBattleNext.addEventListener('click', () => {
  const snapshot = battleController.getSnapshot();
  if (snapshot.status === 'finished') {
    if (snapshot.winner === 'win') {
      feedbackModule.victory();
    } else if (snapshot.winner === 'lose') {
      feedbackModule.defeat();
    } else {
      feedbackModule.softPulse();
    }
    showBattleResult(snapshot);
    return;
  }
  proceedBattleRound();
});
btnBattleStatusHome.addEventListener('click', goHome);
btnBattleRestart.addEventListener('click', startBattleFlow);
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
showScreen('home');
