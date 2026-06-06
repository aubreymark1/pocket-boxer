const DEFAULT_METRICS = {
  x: 0,
  y: 0,
  z: 0,
  magnitude: 0,
};

const SMOOTHING_ALPHA = 0.28;
const MOTION_SCORE_ACTIVATION_DELTA = 3;
const MOTION_SCORE_MAX_DELTA = 35;
const MOTION_SCORE_OVERDRIVE_DELTA = 18;
const MOTION_SCORE_OVERDRIVE_BONUS = 20;

function round(value) {
  return Number(value.toFixed(2));
}

function describeScore(score, source) {
  if (source === 'fallback') {
    if (score >= 85) {
      return '备用模式也打出了很高的分数，可以继续演示。';
    }
    if (score >= 55) {
      return '备用模式有效，分数输出稳定。';
    }
    return '备用模式已出分，可以继续调节蓄力节奏。';
  }

  if (score > 100) {
    return '突破 100 分，已经进入极限爆发区间。';
  }
  if (score >= 90) {
    return '这一下峰值很高，说明短幅度挥拳已经能被明显捕获。';
  }
  if (score >= 65) {
    return '挥拳识别有效，当前阈值已经具备基础可玩性。';
  }
  if (score >= 35) {
    return '动作已被识别，但可以继续优化挥拳幅度或阈值。';
  }
  return '本次动作偏轻或窗口未命中，可以再试一次。';
}

function createInitialState() {
  const motionSupported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;

  return {
    supportStatus: motionSupported ? 'supported' : 'unsupported',
    permissionStatus: motionSupported ? 'not-requested' : 'unsupported',
    mode: motionSupported ? 'motion' : 'fallback',
    listening: false,
    liveMetrics: { ...DEFAULT_METRICS },
    smoothedMagnitude: 0,
    baseline: 0,
    peakMagnitude: 0,
    peakDelta: 0,
    fallbackCharge: 0,
    isCalibrating: false,
    isPunchTestActive: false,
    chargeActive: false,
    result: null,
    statusMessage: motionSupported
      ? '点击请求动作权限开始验证。'
      : '当前环境不支持动作传感器，已可直接使用备用蓄力模式。',
  };
}

export function createMotionController({ onUpdate } = {}) {
  const state = createInitialState();
  const calibrationSamples = [];
  let chargeStartTime = 0;
  let chargeIntervalId = 0;
  let calibrationProgressId = 0;

  function emit() {
    onUpdate?.(getSnapshot());
  }

  function getSnapshot() {
    return {
      supportStatus: state.supportStatus,
      permissionStatus: state.permissionStatus,
      mode: state.mode,
      listening: state.listening,
      liveMetrics: { ...state.liveMetrics },
      smoothedMagnitude: state.smoothedMagnitude,
      baseline: state.baseline,
      peakMagnitude: state.peakMagnitude,
      peakDelta: state.peakDelta,
      fallbackCharge: state.fallbackCharge,
      isCalibrating: state.isCalibrating,
      isPunchTestActive: state.isPunchTestActive,
      chargeActive: state.chargeActive,
      result: state.result ? { ...state.result } : null,
      statusMessage: state.statusMessage,
    };
  }

  function setStatus(message) {
    state.statusMessage = message;
    emit();
  }

  function updateMetricsFromEvent(event) {
    const sample = event.accelerationIncludingGravity || event.acceleration || DEFAULT_METRICS;
    const x = sample.x ?? 0;
    const y = sample.y ?? 0;
    const z = sample.z ?? 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    state.liveMetrics = {
      x: round(x),
      y: round(y),
      z: round(z),
      magnitude: round(magnitude),
    };

    const previousSmoothed = state.smoothedMagnitude || magnitude;
    const smoothedMagnitude = previousSmoothed * (1 - SMOOTHING_ALPHA) + magnitude * SMOOTHING_ALPHA;
    state.smoothedMagnitude = round(smoothedMagnitude);

    if (state.isCalibrating) {
      calibrationSamples.push(smoothedMagnitude);
    }

    if (state.isPunchTestActive) {
      if (smoothedMagnitude > state.peakMagnitude) {
        state.peakMagnitude = round(smoothedMagnitude);
      }

      const peakDelta = Math.max(smoothedMagnitude - state.baseline, 0);
      if (peakDelta > state.peakDelta) {
        state.peakDelta = round(peakDelta);
      }
    }

    emit();
  }

  function ensureMotionListener() {
    if (state.listening || state.supportStatus !== 'supported') {
      return;
    }

    window.addEventListener('devicemotion', updateMetricsFromEvent);
    state.listening = true;
  }

  function mapMotionScore(delta) {
    const adjustedDelta = Math.max(delta - MOTION_SCORE_ACTIVATION_DELTA, 0);
    const cappedDelta = Math.min(adjustedDelta, MOTION_SCORE_MAX_DELTA);
    const baseScore = Math.round((cappedDelta / MOTION_SCORE_MAX_DELTA) * 100);
    const overflowDelta = Math.max(adjustedDelta - MOTION_SCORE_MAX_DELTA, 0);
    const cappedOverflowDelta = Math.min(overflowDelta, MOTION_SCORE_OVERDRIVE_DELTA);
    const overflowScore = Math.round((cappedOverflowDelta / MOTION_SCORE_OVERDRIVE_DELTA) * MOTION_SCORE_OVERDRIVE_BONUS);
    return baseScore + overflowScore;
  }

  async function requestPermission() {
    if (state.supportStatus !== 'supported') {
      state.permissionStatus = 'unsupported';
      state.mode = 'fallback';
      state.statusMessage = '当前环境不支持动作传感器，已切换到备用蓄力模式。';
      emit();
      return getSnapshot();
    }

    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== 'granted') {
        state.permissionStatus = 'denied';
        state.mode = 'fallback';
        state.statusMessage = '动作权限被拒绝，已切换到备用蓄力模式。';
        emit();
        return getSnapshot();
      }
    }

    state.permissionStatus = 'granted';
    state.mode = 'motion';
    ensureMotionListener();
    state.statusMessage = '动作权限已授权，先保持静止并开始校准。';
    emit();
    return getSnapshot();
  }

  async function startCalibration(durationMs = 1200) {
    if (state.permissionStatus !== 'granted') {
      throw new Error('需要先获得动作传感器权限。');
    }

    if (state.isCalibrating) {
      throw new Error('校准已经在进行中。');
    }

    calibrationSamples.length = 0;
    state.isCalibrating = true;
    state.statusMessage = '正在校准，请保持手机静止。';
    emit();

    const startedAt = Date.now();
    calibrationProgressId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= durationMs) {
        window.clearInterval(calibrationProgressId);
      }
      emit();
    }, 80);

    await new Promise((resolve) => window.setTimeout(resolve, durationMs));

    window.clearInterval(calibrationProgressId);
    state.isCalibrating = false;
    state.baseline = calibrationSamples.length
      ? round(calibrationSamples.reduce((sum, value) => sum + value, 0) / calibrationSamples.length)
      : state.liveMetrics.magnitude;
    state.statusMessage = '校准完成，可以开始挥拳测试。';
    emit();

    return {
      baseline: state.baseline,
      samples: calibrationSamples.length,
    };
  }

  async function startPunchTest(durationMs = 2500) {
    if (state.permissionStatus !== 'granted') {
      throw new Error('当前没有可用的动作权限，请先授权或改用备用模式。');
    }

    if (state.isCalibrating) {
      throw new Error('请等待校准结束后再开始挥拳。');
    }

    if (state.isPunchTestActive) {
      throw new Error('挥拳测试已经在进行中。');
    }

    state.mode = 'motion';
    state.isPunchTestActive = true;
    state.peakMagnitude = state.smoothedMagnitude || state.liveMetrics.magnitude;
    state.peakDelta = 0;
    state.result = null;
    state.statusMessage = '挥拳窗口已开启，请立即完成一次短幅度挥拳。';
    emit();

    await new Promise((resolve) => {
      let timeoutId;
      let checkIntervalId;
      let hitDetected = false;
      let hitTime = 0;

      const finish = () => {
        window.clearTimeout(timeoutId);
        window.clearInterval(checkIntervalId);
        resolve();
      };

      // Poll to see if a punch happened (peakDelta > 5)
      checkIntervalId = window.setInterval(() => {
        if (!hitDetected && state.peakDelta > 5) {
          hitDetected = true;
          hitTime = Date.now();
        }
        // If hit was detected, resolve 300ms after the hit to capture the full peak
        if (hitDetected && (Date.now() - hitTime > 300)) {
          finish();
        }
      }, 50);

      // Max duration fallback
      timeoutId = window.setTimeout(finish, durationMs);
    });

    state.isPunchTestActive = false;
    const score = mapMotionScore(state.peakDelta);
    state.result = {
      source: 'motion',
      score,
      peakMagnitude: state.peakMagnitude,
      peakDelta: state.peakDelta,
      baseline: state.baseline,
      message: describeScore(score, 'motion'),
    };
    state.statusMessage = `挥拳测试完成，当前分数 ${score}。`;
    emit();

    return { ...state.result };
  }

  function enableFallbackMode(message = '已切换到备用蓄力模式。') {
    state.mode = 'fallback';
    state.statusMessage = message;
    emit();
    return getSnapshot();
  }

  function startCharge() {
    if (state.chargeActive) {
      return;
    }

    state.mode = 'fallback';
    state.chargeActive = true;
    state.fallbackCharge = 0;
    state.result = null;
    chargeStartTime = Date.now();
    state.statusMessage = '正在蓄力，松手即可生成分数。';
    emit();

    chargeIntervalId = window.setInterval(() => {
      const elapsed = Date.now() - chargeStartTime;
      state.fallbackCharge = Math.min(100, Math.round(elapsed / 14));
      emit();
    }, 40);
  }

  function stopCharge() {
    if (!state.chargeActive) {
      return null;
    }

    state.chargeActive = false;
    window.clearInterval(chargeIntervalId);
    state.fallbackCharge = Math.min(100, Math.max(0, Math.round(state.fallbackCharge)));

    const score = Math.max(8, state.fallbackCharge);
    state.result = {
      source: 'fallback',
      score,
      peakMagnitude: null,
      peakDelta: null,
      baseline: state.baseline,
      message: describeScore(score, 'fallback'),
    };
    state.statusMessage = `备用蓄力完成，当前分数 ${score}。`;
    emit();

    return { ...state.result };
  }

  function resetResult() {
    if (state.chargeActive) {
      window.clearInterval(chargeIntervalId);
      state.chargeActive = false;
    }

    state.result = null;
    state.fallbackCharge = 0;
    state.peakMagnitude = 0;
    state.peakDelta = 0;
    state.statusMessage = state.mode === 'fallback'
      ? '备用模式已重置，可以继续蓄力验证。'
      : '结果已重置，可以重新校准或再次挥拳。';
    emit();
  }

  emit();

  return {
    getSnapshot,
    setStatus,
    requestPermission,
    startCalibration,
    startPunchTest,
    enableFallbackMode,
    startCharge,
    stopCharge,
    resetResult,
  };
}
