import { bootUI, renderUI } from './ui.js';
import { createMotionController } from './motion.js';
import { feedbackModule } from './feedback.js';

const appState = {};

const motionController = createMotionController({
  onUpdate(snapshot) {
    Object.assign(appState, snapshot);
    renderUI(appState);
  },
});

function syncUI() {
  Object.assign(appState, motionController.getSnapshot());
  renderUI(appState);
}

function attachHandlers() {
  bootUI({
    onRequestPermission: async () => {
      const snapshot = await motionController.requestPermission();
      if (snapshot.permissionStatus === 'granted') {
        feedbackModule.tap();
      }
    },
    onStartCalibration: async () => {
      await motionController.startCalibration();
      feedbackModule.softPulse();
    },
    onStartPunchTest: async () => {
      feedbackModule.tap();
      const result = await motionController.startPunchTest();
      feedbackModule.scorePulse(result.score);
    },
    onUseFallback: () => {
      motionController.enableFallbackMode('已切换到备用蓄力模式。');
      feedbackModule.softPulse();
    },
    onResetResult: () => {
      motionController.resetResult();
    },
    onChargeStart: () => {
      motionController.enableFallbackMode('正在蓄力，松手即可出分。');
      motionController.startCharge();
    },
    onChargeEnd: () => {
      const result = motionController.stopCharge();
      if (result) {
        feedbackModule.scorePulse(result.score);
      }
    },
    onActionError: (error) => {
      const message = error instanceof Error ? error.message : String(error);
      motionController.setStatus(message);
    },
  });
}

attachHandlers();
syncUI();
