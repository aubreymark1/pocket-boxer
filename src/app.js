import { bootUI } from './ui.js';
import { motionModule } from './motion.js';
import { battleModule } from './battle.js';
import { feedbackModule } from './feedback.js';

const appContext = {
  status: 'stage1-ready',
  motionModule,
  battleModule,
  feedbackModule,
};

bootUI(appContext);
console.log('Pocket Boxer Stage 1 scaffold ready.', appContext);
