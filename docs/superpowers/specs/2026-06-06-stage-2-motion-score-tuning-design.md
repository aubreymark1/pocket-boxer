# Stage 2 Motion Score Tuning Design

**Goal**
Stabilize iPhone motion scoring in Stage 2 by reducing spike sensitivity while still allowing strong punches to break `100` in a controlled arcade-style range.

**Problem**
Current scoring reads raw peak motion too directly. On iPhone testing, a baseline near `9.8` can still produce peaks above `180`, which causes unrealistically high score inputs and weak separation between light movement and an intentional punch.

**Chosen Approach**
Apply lightweight smoothing to motion magnitude, then score against a filtered peak delta instead of the raw single-frame peak.

This design adds four controls:
- smoothing
- a minimum activation threshold
- a capped scoring window
- a limited overdrive bonus above `100`

This is preferred over a full rewrite because it keeps the Stage 2 validation console intact while making scores more stable immediately.

## Scope

This change covers:
- tuning logic inside `src/motion.js`
- smoothing the sampled magnitude for punch evaluation
- adding a minimum threshold to ignore weak motion
- capping the main scoring window before mapping to `0-100`
- adding a controlled `100-120` overdrive zone for very strong punches

This change does not cover:
- page layout changes
- battle logic
- countdown flow
- advanced directional punch recognition

## Scoring Design

### 1. Keep The Existing Baseline

Calibration still computes a baseline magnitude while the phone is held still.

Example:
- baseline near `9.8` is expected on iPhone because gravity is included

### 2. Add Smoothed Magnitude

Raw magnitude is still useful for debug display, but scoring should use a smoothed value:

```js
smoothedMagnitude = previousSmoothed * 0.72 + currentMagnitude * 0.28;
```

This reduces the effect of one-frame spikes.

### 3. Track Smoothed Peak Delta

During the punch window:
- keep the highest smoothed magnitude
- compute `peakDelta = smoothedPeak - baseline`

This value becomes the score input instead of the raw instantaneous peak.

### 4. Ignore Weak Motion

Add a start threshold so light shaking does not immediately produce score:

```js
adjustedDelta = Math.max(peakDelta - 8, 0);
```

This means small movement under roughly `8` points above baseline is treated as noise.

### 5. Cap The Main Effective Range

To avoid very large spikes dominating the score:

```js
cappedDelta = Math.min(adjustedDelta, 52);
```

This preserves the main scoring ladder up to `100`.

### 6. Add Overdrive Bonus

For very strong punches, allow a small bonus above `100` instead of hard-stopping immediately:

```js
overflowDelta = Math.max(adjustedDelta - 52, 0);
cappedOverflowDelta = Math.min(overflowDelta, 18);
overflowScore = Math.round((cappedOverflowDelta / 18) * 20);
```

### 7. Map To Final Score

Final score:

```js
baseScore = Math.round((cappedDelta / 52) * 100);
score = baseScore + overflowScore;
```

This creates a controlled final range of `0-120`.

## Expected Behavior

After tuning:
- idle noise should usually stay near `0-20`
- normal short punches should land roughly in `35-75`
- strong clear punches should land in `80-100`
- very strong clear punches can enter `101-120`
- one-frame spikes should no longer create extreme score jumps

## File Impact

- `src/motion.js`
  - add smoothed magnitude state
  - use smoothed peak for punch evaluation
  - replace the current direct delta mapping with the tuned scoring window

## Success Criteria

This tuning is successful when:
- light shaking does not frequently generate high scores
- iPhone punch peaks no longer blow out the score immediately
- repeated punches show more stable score ranges
- Stage 2 validation UI still works without structural changes
