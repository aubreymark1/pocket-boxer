let appHandlers = null;
let currentAppShell = null;

const injectedCSS = `
  .game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background: #090c16;
    color: #f4f7ff;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  .title-main {
    font-size: 12vw;
    font-weight: bold;
    margin-bottom: 10px;
    width: 100%;
  }
  .title-sub {
    font-size: 4vw;
    margin-bottom: 40px;
    color: #9aa7cf;
  }
  .btn-primary {
    background: linear-gradient(135deg, #ff4d5a 0%, #ff8d4d 100%);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 15px 40px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(255, 77, 90, 0.4);
    transition: transform 0.1s;
    width: 80%;
    max-width: 300px;
    margin-bottom: 20px;
  }
  .btn-primary:active {
    transform: scale(0.95);
  }
  .desc-text {
    font-size: 14px;
    color: #9aa7cf;
    line-height: 1.5;
    max-width: 80%;
  }
`;

function injectStyles() {
  if (!document.getElementById('pocket-boxer-styles')) {
    const style = document.createElement('style');
    style.id = 'pocket-boxer-styles';
    style.textContent = injectedCSS;
    document.head.appendChild(style);
  }
}

export function bootUI(handlers) {
  appHandlers = handlers;
  injectStyles();
  
  // Find or create app-shell
  currentAppShell = document.querySelector('.app-shell');
  if (!currentAppShell) {
    currentAppShell = document.createElement('div');
    currentAppShell.className = 'app-shell';
    document.body.appendChild(currentAppShell);
  }
}

function getScreen(state) {
  if (state.screen) return state.screen;
  
  // Fallback deduction for testing before app-flow is integrated
  if (state.result) return 'result';
  if (state.isPunchTestActive) return 'punch';
  if (state.isCalibrating) return 'calibrating';
  if (state.permissionStatus === 'granted') return 'safety'; // Map to safety to test it
  return 'home';
}

function renderHome(state) {
  return `
    <div class="game-container">
      <div class="title-main">Pocket Boxer</div>
      <div class="title-sub">握紧手机，挥出一拳</div>
      <button class="btn-primary" id="btn-start-test">开始测试</button>
      <div class="desc-text">根据你的挥拳速度和力量，计算出你的爆发力得分。请在安全的环境下进行测试！</div>
    </div>
  `;
}

function renderSafety(state) {
  return `
    <div class="game-container">
      <div class="safety-title">安全须知</div>
      <div class="safety-list">
        <div class="safety-item"><span>⚠️</span> 握紧手机</div>
        <div class="safety-item"><span>⚠️</span> 只做短幅度挥拳</div>
        <div class="safety-item"><span>⚠️</span> 不要砸向人/桌子/墙和其他物体</div>
        <div class="safety-item"><span>⚠️</span> 周围确认无障碍物</div>
      </div>
      <button class="btn-primary" id="btn-safety-confirm">我已了解，开始游戏</button>
    </div>
  `;
}

function renderCalibrating(state) {
  return `
    <div class="game-container" style="background: #1a1e2e;">
      <div class="calibrating-title">请保持手机静止</div>
      <div class="loader"></div>
      <div class="desc-text">${state.statusMessage || '正在获取传感器数据...'}</div>
    </div>
  `;
}

function renderCountdown(state) {
  const value = state.countdownValue !== undefined ? state.countdownValue : '3';
  const isPunch = value === 'PUNCH!' || value === 0;
  
  if (isPunch) {
    return `
      <div class="game-container">
        <div class="punch-text">PUNCH!</div>
      </div>
    `;
  }
  
  return `
    <div class="game-container">
      <div class="countdown-number" key="${value}">${value}</div>
    </div>
  `;
}

function renderPunch(state) {
  return `
    <div class="game-container punching-pulse">
      <div class="punch-text" style="animation: none;">现在挥拳！</div>
      <div class="desc-text" style="margin-top: 20px; font-size: 18px;">${state.statusMessage || '采样中...'}</div>
    </div>
  `;
}

export function renderUI(state) {
  if (!currentAppShell) return;

  const screen = getScreen(state);
  let html = '';

  switch (screen) {
    case 'home':
      html = renderHome(state);
      break;
    case 'safety':
      html = renderSafety(state);
      break;
    case 'calibrating':
      html = renderCalibrating(state);
      break;
    case 'countdown':
      html = renderCountdown(state);
      break;
    case 'punch':
      html = renderPunch(state);
      break;
    default:
      html = renderHome(state);
      break;
  }

  currentAppShell.innerHTML = html;

  // Bind events for home
  if (screen === 'home') {
    const btn = document.getElementById('btn-start-test');
    if (btn) {
      btn.addEventListener('click', () => {
        if (appHandlers.onRequestPermission) {
          appHandlers.onRequestPermission().catch(appHandlers.onActionError);
        }
      });
    }
  }

  // Bind events for safety
  if (screen === 'safety') {
    const btn = document.getElementById('btn-safety-confirm');
    if (btn) {
      btn.addEventListener('click', () => {
        if (appHandlers.onStartCalibration) {
          appHandlers.onStartCalibration().catch(appHandlers.onActionError);
        }
      });
    }
  }
}

