# Motion Score Stricter Curve Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the punch score curve in `src/motion.js` so ordinary punches land lower, `300~700` is more selective, and `800+` becomes meaningfully hard to reach.

**Architecture:** Keep the existing Stage 3 data flow unchanged and limit the behavior change to `src/motion.js`. Raise the motion activation threshold, widen the delta normalization window, then shift both middle and high score breakpoints upward and steepen the high-end curve so the whole scoring system becomes stricter without changing downstream consumers.

**Tech Stack:** Vanilla JavaScript, browser `DeviceMotionEvent`, existing punch result flow

---

### Task 1: Tighten Motion Threshold Constants

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\pocket-boxer\src\motion.js`

- [ ] **Step 1: Raise the motion start threshold**

Update the constants section so minor shake contributes less score:

```js
const MOTION_SCORE_ACTIVATION_DELTA = 4.5;
const MOTION_SCORE_MAX_DELTA = 52;
```

- [ ] **Step 2: Shift middle and high breakpoints later**

Update the score shaping constants so mid and high ranges require more normalized input:

```js
const SCORE_MIDPOINT_RATIO = 0.62;
const SCORE_HIGH_THRESHOLD_RATIO = 0.9;
const SCORE_MIDPOINT = 360;
const SCORE_HIGH_THRESHOLD = 780;
```

- [ ] **Step 3: Commit**

```bash
git add src/motion.js
git commit -m "tune: tighten motion score thresholds"
```

### Task 2: Steepen The Score Mapping Curve

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\pocket-boxer\src\motion.js`

- [ ] **Step 1: Keep low scores easier than high scores**

Retain the three-stage mapping but make the final segment much harsher:

```js
function mapNormalizedScore(normalizedValue) {
  const normalized = Math.max(0, Math.min(normalizedValue, 1));

  if (normalized <= SCORE_MIDPOINT_RATIO) {
    return Math.round((normalized / SCORE_MIDPOINT_RATIO) * SCORE_MIDPOINT);
  }

  if (normalized <= SCORE_HIGH_THRESHOLD_RATIO) {
    const progress = (normalized - SCORE_MIDPOINT_RATIO) / (SCORE_HIGH_THRESHOLD_RATIO - SCORE_MIDPOINT_RATIO);
    return Math.round(SCORE_MIDPOINT + Math.pow(progress, 1.18) * (SCORE_HIGH_THRESHOLD - SCORE_MIDPOINT));
  }

  const highProgress = (normalized - SCORE_HIGH_THRESHOLD_RATIO) / (1 - SCORE_HIGH_THRESHOLD_RATIO);
  const curvedProgress = Math.pow(highProgress, 2.7);
  return Math.round(SCORE_HIGH_THRESHOLD + curvedProgress * (SCORE_MAX - SCORE_HIGH_THRESHOLD));
}
```

- [ ] **Step 2: Keep fallback mode aligned**

Do not change the fallback data flow. Keep it calling `mapNormalizedScore(normalizedCharge)` so the stricter curve also applies to hold-to-charge mode.

- [ ] **Step 3: Commit**

```bash
git add src/motion.js
git commit -m "tune: steepen high-end motion score curve"
```

### Task 3: Update Copy And Verify

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\pocket-boxer\src\motion.js`

- [ ] **Step 1: Align score copy with the harsher curve**

Adjust the descriptive copy only if the new score distribution makes the current wording misleading. Keep the threshold language centered on `320`, `600`, `800`, and `900`.

- [ ] **Step 2: Run diagnostics**

Check:

```bash
# via IDE diagnostics or existing tooling
```

Expected: `src/motion.js` reports no syntax or lint diagnostics.

- [ ] **Step 3: Manual verification**

Confirm these outcome targets:

```text
- light shake stays near very low scores
- normal punch tends to land below the previous range
- strong punch can reach mid/high scores but not 800+ too often
- only clearly explosive punches approach 800+
```

- [ ] **Step 4: Commit**

```bash
git add src/motion.js
git commit -m "chore: verify stricter motion score curve"
```
