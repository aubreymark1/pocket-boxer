let elements;

function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--';
  }

  return value.toFixed(2);
}

function setBadgeClass(node, variant) {
  node.className = node.className.split(' ').filter((name) => name !== 'is-good' && name !== 'is-warn').join(' ').trim();

  if (variant === 'good') {
    node.classList.add('is-good');
  }

  if (variant === 'warn') {
    node.classList.add('is-warn');
  }
}

function getChipState(state) {
  if (state.isPunchTestActive) {
    return { label: '测试中', variant: 'warn' };
  }

  if (state.isCalibrating) {
    return { label: '校准中', variant: 'warn' };
  }

  if (state.result) {
    return { label: '已出结果', variant: 'good' };
  }

  if (state.permissionStatus === 'granted') {
    return { label: '已就绪', variant: 'good' };
  }

  if (state.permissionStatus === 'denied' || state.supportStatus === 'unsupported') {
    return { label: '备用模式', variant: 'warn' };
  }

  return { label: '等待开始', variant: '' };
}

function bindPointerHandlers(node, handlers) {
  let pointerActive = false;

  node.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pointerActive = true;
    handlers.onChargeStart();
  });

  const endCharge = (event) => {
    if (!pointerActive) {
      return;
    }

    pointerActive = false;
    if (event) {
      event.preventDefault();
    }
    handlers.onChargeEnd();
  };

  node.addEventListener('pointerup', endCharge);
  node.addEventListener('pointercancel', endCharge);
  node.addEventListener('pointerleave', endCharge);
  window.addEventListener('pointerup', endCharge);
}

export function bootUI(handlers) {
  elements = {
    statusChip: document.querySelector('#status-chip'),
    supportStatus: document.querySelector('#support-status'),
    permissionStatus: document.querySelector('#permission-status'),
    modeStatus: document.querySelector('#mode-status'),
    listeningStatus: document.querySelector('#listening-status'),
    statusMessage: document.querySelector('#status-message'),
    metricX: document.querySelector('#metric-x'),
    metricY: document.querySelector('#metric-y'),
    metricZ: document.querySelector('#metric-z'),
    metricMagnitude: document.querySelector('#metric-magnitude'),
    metricBaseline: document.querySelector('#metric-baseline'),
    metricPeak: document.querySelector('#metric-peak'),
    fallbackModeBadge: document.querySelector('#fallback-mode-badge'),
    chargeFill: document.querySelector('#charge-fill'),
    chargeValue: document.querySelector('#charge-value'),
    resultSource: document.querySelector('#result-source'),
    resultScore: document.querySelector('#result-score'),
    resultPeak: document.querySelector('#result-peak'),
    resultDelta: document.querySelector('#result-delta'),
    resultMessage: document.querySelector('#result-message'),
    requestPermissionButton: document.querySelector('#request-permission-btn'),
    startCalibrationButton: document.querySelector('#start-calibration-btn'),
    startPunchTestButton: document.querySelector('#start-punch-test-btn'),
    useFallbackButton: document.querySelector('#use-fallback-btn'),
    resetResultButton: document.querySelector('#reset-result-btn'),
    chargeButton: document.querySelector('#charge-button'),
  };

  elements.requestPermissionButton.addEventListener('click', () => {
    handlers.onRequestPermission().catch(handlers.onActionError);
  });

  elements.startCalibrationButton.addEventListener('click', () => {
    handlers.onStartCalibration().catch(handlers.onActionError);
  });

  elements.startPunchTestButton.addEventListener('click', () => {
    handlers.onStartPunchTest().catch(handlers.onActionError);
  });

  elements.useFallbackButton.addEventListener('click', () => {
    try {
      handlers.onUseFallback();
    } catch (error) {
      handlers.onActionError(error);
    }
  });

  elements.resetResultButton.addEventListener('click', () => {
    try {
      handlers.onResetResult();
    } catch (error) {
      handlers.onActionError(error);
    }
  });

  bindPointerHandlers(elements.chargeButton, handlers);
}

export function renderUI(state) {
  if (!elements) {
    return;
  }

  const chipState = getChipState(state);
  elements.statusChip.textContent = chipState.label;
  setBadgeClass(elements.statusChip, chipState.variant);

  elements.supportStatus.textContent = state.supportStatus === 'supported' ? '支持' : '不支持';

  const permissionMap = {
    'not-requested': '未请求',
    granted: '已授权',
    denied: '已拒绝',
    unsupported: '不支持',
  };

  elements.permissionStatus.textContent = permissionMap[state.permissionStatus] || state.permissionStatus;
  elements.modeStatus.textContent = state.mode === 'fallback' ? '备用蓄力' : '传感器';
  elements.listeningStatus.textContent = state.listening ? '监听中' : '未监听';
  elements.statusMessage.textContent = state.statusMessage;

  elements.metricX.textContent = formatNumber(state.liveMetrics.x);
  elements.metricY.textContent = formatNumber(state.liveMetrics.y);
  elements.metricZ.textContent = formatNumber(state.liveMetrics.z);
  elements.metricMagnitude.textContent = formatNumber(state.liveMetrics.magnitude);
  elements.metricBaseline.textContent = formatNumber(state.baseline);
  elements.metricPeak.textContent = formatNumber(state.peakMagnitude);

  const fallbackActive = state.mode === 'fallback';
  elements.fallbackModeBadge.textContent = fallbackActive ? '已启用' : '未启用';
  setBadgeClass(elements.fallbackModeBadge, fallbackActive ? 'good' : '');

  elements.chargeFill.style.width = `${state.fallbackCharge}%`;
  elements.chargeValue.textContent = String(Math.round(state.fallbackCharge));

  const result = state.result;
  elements.resultSource.textContent = result ? (result.source === 'motion' ? '传感器挥拳' : '备用蓄力') : '暂无';
  elements.resultScore.textContent = result ? String(result.score) : '--';
  elements.resultPeak.textContent = result && result.peakMagnitude !== null ? formatNumber(result.peakMagnitude) : '--';
  elements.resultDelta.textContent = result && result.peakDelta !== null ? formatNumber(result.peakDelta) : '--';
  elements.resultMessage.textContent = result ? result.message : '还没有结果，先开始一次验证。';

  elements.requestPermissionButton.disabled = state.supportStatus !== 'supported' || state.permissionStatus === 'granted';
  elements.startCalibrationButton.disabled = state.permissionStatus !== 'granted' || state.isCalibrating || state.isPunchTestActive;
  elements.startPunchTestButton.disabled = state.permissionStatus !== 'granted' || state.isCalibrating || state.isPunchTestActive;
  elements.useFallbackButton.disabled = false;
  elements.resetResultButton.disabled = !result && state.fallbackCharge === 0;
  elements.chargeButton.disabled = !fallbackActive;

  document.body.dataset.mode = state.mode;
}
