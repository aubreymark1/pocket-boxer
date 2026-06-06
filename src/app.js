import { createMotionController } from './motion.js';
import { feedbackModule } from './feedback.js';

// DOM Elements
const screens = {
  home: document.getElementById('screen-home'),
  safety: document.getElementById('screen-safety'),
  calibrating: document.getElementById('screen-calibrating'),
  countdown: document.getElementById('screen-countdown'),
  punch: document.getElementById('screen-punch'),
  result: document.getElementById('screen-result')
};

const countdownDisplay = document.getElementById('countdown-display');
const motionUi = document.getElementById('punch-motion-ui');
const fallbackUi = document.getElementById('punch-fallback-ui');
const chargeFill = document.getElementById('fallback-charge-fill');
const fallbackBtn = document.getElementById('btn-fallback-charge');

const btnStart = document.getElementById('btn-start');
const btnSafetyOk = document.getElementById('btn-safety-ok');
const btnRetry = document.getElementById('btn-retry');
const btnHome = document.getElementById('btn-home');

const resScore = document.getElementById('res-score');
const resRating = document.getElementById('res-rating');
const resDamage = document.getElementById('res-damage');
const resultTitle = document.getElementById('result-title');
const appContainer = document.getElementById('app-container');
const bagResult = document.getElementById('bag-result');

// Initialize motion controller
const motionController = createMotionController({
  onUpdate(snapshot) {
    if (snapshot.chargeActive && chargeFill) {
      chargeFill.style.width = `${snapshot.fallbackCharge}%`;
    }
  }
});

// Helper to show a specific screen
function showScreen(screenName) {
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.remove('active');
  });
  if (screens[screenName]) {
    screens[screenName].classList.add('active');
  }
}

// Flow: Safety Confirmed -> Request Permission -> Calibrate -> Countdown
async function proceedFromSafety() {
  try {
    const snapshot = await motionController.requestPermission();
    if (snapshot.permissionStatus === 'granted') {
      feedbackModule.tap();
      showScreen('calibrating');
      await motionController.startCalibration();
      startCountdown();
    } else {
      // fallback mode
      startCountdown();
    }
  } catch (err) {
    console.error(err);
    alert('发生错误: ' + (err.message || String(err)));
  }
}

// Flow: Countdown
async function startCountdown() {
  showScreen('countdown');
  
  for (let i = 3; i > 0; i--) {
    countdownDisplay.textContent = i;
    feedbackModule.softPulse();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  startPunch();
}

// Flow: Punch
async function startPunch() {
  showScreen('punch');
  const state = motionController.getSnapshot();
  
  if (state.mode === 'motion') {
    motionUi.style.display = 'block';
    fallbackUi.style.display = 'none';
    
    try {
      const result = await motionController.startPunchTest();
      showResult(result);
    } catch (err) {
      console.error(err);
      alert('挥拳测试失败: ' + (err.message || String(err)));
    }
  } else {
    // fallback mode
    motionUi.style.display = 'none';
    fallbackUi.style.display = 'block';
    chargeFill.style.width = '0%';
  }
}

// Flow: Show Result
function showResult(result) {
  showScreen('result');
  feedbackModule.scorePulse(result.score);
  
  // Apply Screen Shake
  appContainer.classList.remove('screen-shake');
  void appContainer.offsetWidth;
  appContainer.classList.add('screen-shake');
  
  resScore.textContent = result.score;
  
  // Calculate game-like damage based on score/peak
  const damage = Math.floor(result.score * 15 + (result.peakMagnitude || 0) * 10);
  resDamage.textContent = `+${damage}`;
  
  // Evaluate Rating
  let rating = 'MISS';
  let title = '命中！';
  if (result.score >= 90) { rating = 'PERFECT HIT'; title = '完美一击！'; }
  else if (result.score >= 60) { rating = 'HEAVY HIT'; title = '重击！'; }
  else if (result.score >= 30) { rating = 'GOOD HIT'; title = '命中！'; }
  else { rating = 'LIGHT HIT'; title = '擦边...'; }
  
  resRating.textContent = rating;
  resultTitle.textContent = title;
  
  // Extreme hit colors
  if (result.score >= 90) {
    resDamage.style.color = 'var(--accent-good)';
    resRating.style.color = 'var(--accent-good)';
  } else {
    resDamage.style.color = 'var(--accent)';
    resRating.style.color = '#fff';
  }
}

// Event Listeners
btnStart.addEventListener('click', () => {
  showScreen('safety');
});

btnSafetyOk.addEventListener('click', proceedFromSafety);

btnRetry.addEventListener('click', () => {
  motionController.resetResult();
  proceedFromSafety();
});

btnHome.addEventListener('click', () => {
  motionController.resetResult();
  showScreen('home');
});

// Setup Fallback Button logic
let pointerActive = false;
fallbackBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  pointerActive = true;
  motionController.startCharge();
  feedbackModule.softPulse();
});

const endCharge = (e) => {
  if (!pointerActive) return;
  pointerActive = false;
  if (e) e.preventDefault();
  
  const result = motionController.stopCharge();
  if (result) {
    showResult(result);
  }
};

fallbackBtn.addEventListener('pointerup', endCharge);
fallbackBtn.addEventListener('pointercancel', endCharge);
fallbackBtn.addEventListener('pointerleave', endCharge);
window.addEventListener('pointerup', endCharge);

// Init
showScreen('home');
