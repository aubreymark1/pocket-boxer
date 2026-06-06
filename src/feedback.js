function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

function vibrate(pattern) {
  if (!canVibrate()) {
    return false;
  }

  navigator.vibrate(pattern);
  return true;
}

export const feedbackModule = {
  isSupported() {
    return canVibrate();
  },
  tap() {
    vibrate(20);
  },
  softPulse() {
    vibrate([18, 40, 18]);
  },
  scorePulse(score) {
    if (score >= 80) {
      vibrate([40, 50, 40, 50, 40]);
      return;
    }

    if (score >= 40) {
      vibrate([28, 40, 28]);
      return;
    }

    vibrate(20);
  },
};
