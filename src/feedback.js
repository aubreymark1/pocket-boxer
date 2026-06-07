function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

function getAudioContextCtor() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.AudioContext || window.webkitAudioContext || null;
}

let audioContext = null;
let unlockListenersInstalled = false;
let noiseBuffer = null;

function canUseAudio() {
  return Boolean(getAudioContextCtor());
}

function getAudioContext() {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) {
    return null;
  }

  audioContext = new AudioContextCtor();
  return audioContext;
}

async function unlockAudio() {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  if (context.state === 'suspended') {
    await context.resume();
  }

  return context.state === 'running';
}

function scheduleTone(context, step, startAt) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const duration = step.duration ?? 0.12;
  const attack = step.attack ?? 0.01;
  const volume = step.volume ?? 0.05;
  const endAt = startAt + duration;

  oscillator.type = step.type ?? 'square';
  oscillator.frequency.setValueAtTime(step.fromFrequency ?? step.frequency, startAt);

  if (typeof step.frequency === 'number' && step.fromFrequency !== step.frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(step.frequency, 1), endAt);
  }

  if (typeof step.detune === 'number') {
    oscillator.detune.setValueAtTime(step.detune, startAt);
  }

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

function getNoiseBuffer(context) {
  if (noiseBuffer) {
    return noiseBuffer;
  }

  const length = Math.max(1, Math.floor(context.sampleRate * 0.25));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let index = 0; index < length; index += 1) {
    channelData[index] = Math.random() * 2 - 1;
  }

  noiseBuffer = buffer;
  return noiseBuffer;
}

function scheduleNoiseBurst(context, burst, startAt) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gainNode = context.createGain();
  const duration = burst.duration ?? 0.12;
  const endAt = startAt + duration;

  source.buffer = getNoiseBuffer(context);

  filter.type = burst.filterType ?? 'bandpass';
  filter.frequency.setValueAtTime(burst.frequency ?? 1200, startAt);
  if (typeof burst.q === 'number') {
    filter.Q.setValueAtTime(burst.q, startAt);
  }

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(burst.volume ?? 0.05, 0.0001), startAt + (burst.attack ?? 0.01));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(context.destination);
  source.start(startAt);
  source.stop(endAt + 0.02);
}

function scheduleImpactSweep(context, step, startAt) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const duration = step.duration ?? 0.16;
  const endAt = startAt + duration;
  const attack = step.attack ?? 0.004;
  const peakVolume = step.volume ?? 0.08;
  const sustainVolume = step.sustainVolume ?? peakVolume * 0.45;

  oscillator.type = step.type ?? 'sawtooth';
  oscillator.frequency.setValueAtTime(step.fromFrequency ?? step.frequency ?? 160, startAt);

  if (typeof step.frequency === 'number') {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(step.frequency, 1), endAt);
  }

  if (typeof step.detune === 'number') {
    oscillator.detune.setValueAtTime(step.detune, startAt);
  }

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(peakVolume, 0.0001), startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(sustainVolume, 0.0001), startAt + duration * 0.28);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

function playSequence(sequence) {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  const run = () => {
    const baseTime = context.currentTime + 0.01;
    let cursor = 0;

    sequence.forEach((step) => {
      const startAt = baseTime + cursor;
      scheduleTone(context, step, startAt);
      cursor += step.gap ?? step.duration ?? 0.12;
    });
  };

  try {
    if (context.state === 'running') {
      run();
      return true;
    }

    unlockAudio()
      .then((ready) => {
        if (ready) {
          run();
        }
      })
      .catch(() => {});
  } catch (_error) {
    return false;
  }

  return false;
}

function vibrate(pattern) {
  if (!canVibrate()) {
    return false;
  }

  navigator.vibrate(pattern);
  return true;
}

function playButtonSound() {
  return playSequence([
    { fromFrequency: 540, frequency: 760, duration: 0.05, volume: 0.035, type: 'square', gap: 0.05 },
  ]);
}

function playCountdownSound() {
  return playSequence([
    { fromFrequency: 880, frequency: 880, duration: 0.09, volume: 0.04, type: 'square', gap: 0.09 },
  ]);
}

function playPunchSound() {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  const sequence = [
    { fromFrequency: 420, frequency: 120, duration: 0.085, volume: 0.055, type: 'sawtooth', gap: 0.045 },
    { fromFrequency: 150, frequency: 62, duration: 0.11, volume: 0.08, type: 'triangle', gap: 0.06 },
    { fromFrequency: 84, frequency: 42, duration: 0.09, volume: 0.04, type: 'sine', gap: 0.08 },
  ];

  const playBurst = () => {
    const baseTime = context.currentTime + 0.01;
    scheduleNoiseBurst(context, {
      duration: 0.055,
      attack: 0.003,
      volume: 0.055,
      frequency: 980,
      q: 1.6,
    }, baseTime);
    scheduleNoiseBurst(context, {
      duration: 0.12,
      attack: 0.006,
      volume: 0.03,
      filterType: 'lowpass',
      frequency: 260,
      q: 0.9,
    }, baseTime + 0.012);
  };

  try {
    if (context.state === 'running') {
      playSequence(sequence);
      playBurst();
      return true;
    }

    unlockAudio()
      .then((ready) => {
        if (ready) {
          playSequence(sequence);
          playBurst();
        }
      })
      .catch(() => {});
  } catch (_error) {
    return false;
  }

  return false;
}

function playHitSound(score = 50) {
  const isHeavyHit = score >= 700;
  const isCriticalHit = score >= 900;
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  const sequence = [
    {
      fromFrequency: isHeavyHit ? 840 : 610,
      frequency: isHeavyHit ? 170 : 250,
      duration: isHeavyHit ? 0.14 : 0.11,
      volume: isHeavyHit ? 0.12 : 0.085,
      type: 'sawtooth',
      gap: 0.04,
    },
    {
      fromFrequency: isHeavyHit ? 220 : 180,
      frequency: 72,
      duration: 0.13,
      volume: isHeavyHit ? 0.09 : 0.06,
      type: 'triangle',
      gap: 0.06,
    },
    {
      fromFrequency: isHeavyHit ? 96 : 82,
      frequency: 48,
      duration: 0.12,
      volume: isHeavyHit ? 0.06 : 0.03,
      type: 'sine',
      gap: 0.1,
    },
  ];

  const playBurst = () => {
    const baseTime = context.currentTime + 0.01;

    // Front-edge crack that sells the glove snapping into the target.
    scheduleNoiseBurst(context, {
      duration: isCriticalHit ? 0.12 : isHeavyHit ? 0.09 : 0.06,
      attack: 0.003,
      volume: isCriticalHit ? 0.1 : isHeavyHit ? 0.07 : 0.045,
      frequency: isCriticalHit ? 1850 : isHeavyHit ? 1450 : 1050,
      q: isCriticalHit ? 2.2 : 1.8,
    }, baseTime);

    // Mid impact body, the chesty "boom" underneath the crack.
    scheduleNoiseBurst(context, {
      duration: isCriticalHit ? 0.16 : isHeavyHit ? 0.13 : 0.09,
      attack: 0.006,
      volume: isCriticalHit ? 0.05 : isHeavyHit ? 0.035 : 0.02,
      filterType: 'lowpass',
      frequency: isCriticalHit ? 520 : isHeavyHit ? 420 : 300,
      q: 0.8,
    }, baseTime + 0.015);

    // Low-end cannon thump for stronger hits.
    scheduleImpactSweep(context, {
      fromFrequency: isCriticalHit ? 180 : isHeavyHit ? 150 : 120,
      frequency: isCriticalHit ? 46 : isHeavyHit ? 52 : 60,
      duration: isCriticalHit ? 0.22 : isHeavyHit ? 0.18 : 0.14,
      attack: 0.004,
      volume: isCriticalHit ? 0.095 : isHeavyHit ? 0.072 : 0.05,
      sustainVolume: isCriticalHit ? 0.05 : isHeavyHit ? 0.038 : 0.025,
      type: 'triangle',
    }, baseTime + 0.008);

    // Metallic air-rip tail so the hit feels larger than the screen.
    scheduleImpactSweep(context, {
      fromFrequency: isCriticalHit ? 980 : isHeavyHit ? 840 : 680,
      frequency: isCriticalHit ? 260 : isHeavyHit ? 220 : 180,
      duration: isCriticalHit ? 0.18 : isHeavyHit ? 0.15 : 0.11,
      attack: 0.002,
      volume: isCriticalHit ? 0.06 : isHeavyHit ? 0.045 : 0.028,
      sustainVolume: isCriticalHit ? 0.02 : isHeavyHit ? 0.016 : 0.01,
      type: 'sawtooth',
      detune: isCriticalHit ? 9 : 4,
    }, baseTime + 0.02);

    if (isCriticalHit) {
      scheduleNoiseBurst(context, {
        duration: 0.18,
        attack: 0.004,
        volume: 0.035,
        filterType: 'highpass',
        frequency: 2100,
        q: 1.2,
      }, baseTime + 0.028);
    }
  };

  try {
    if (context.state === 'running') {
      playSequence(sequence);
      playBurst();
      return true;
    }

    unlockAudio()
      .then((ready) => {
        if (ready) {
          playSequence(sequence);
          playBurst();
        }
      })
      .catch(() => {});
  } catch (_error) {
    return false;
  }

  return false;
}

function playVictorySound() {
  return playSequence([
    { fromFrequency: 440, frequency: 440, duration: 0.08, volume: 0.045, type: 'square', gap: 0.09 },
    { fromFrequency: 554, frequency: 554, duration: 0.08, volume: 0.05, type: 'square', gap: 0.09 },
    { fromFrequency: 659, frequency: 659, duration: 0.13, volume: 0.055, type: 'square', gap: 0.13 },
  ]);
}

function playDefeatSound() {
  return playSequence([
    { fromFrequency: 320, frequency: 240, duration: 0.11, volume: 0.045, type: 'triangle', gap: 0.11 },
    { fromFrequency: 240, frequency: 160, duration: 0.15, volume: 0.04, type: 'triangle', gap: 0.15 },
  ]);
}

export const feedbackModule = {
  isSupported() {
    return canVibrate() || canUseAudio();
  },
  installUnlockListeners(target = document) {
    if (!target || unlockListenersInstalled) {
      return;
    }

    unlockListenersInstalled = true;
    const unlockOnce = () => {
      unlockAudio().catch(() => {});
    };

    target.addEventListener('pointerdown', unlockOnce, { passive: true });
    target.addEventListener('touchstart', unlockOnce, { passive: true });
    target.addEventListener('keydown', unlockOnce, { passive: true });
  },
  tap() {
    vibrate(20);
    playButtonSound();
  },
  softPulse() {
    vibrate([18, 40, 18]);
  },
  unlockAudio() {
    return unlockAudio().catch(() => false);
  },
  countdownTick() {
    playCountdownSound();
  },
  punch() {
    playPunchSound();
  },
  hit(score) {
    playHitSound(score);
  },
  victory() {
    playVictorySound();
  },
  defeat() {
    playDefeatSound();
  },
  scorePulse(score) {
    if (score >= 800) {
      vibrate([40, 50, 40, 50, 40]);
      return;
    }

    if (score >= 420) {
      vibrate([28, 40, 28]);
      return;
    }

    vibrate(20);
  },
};
