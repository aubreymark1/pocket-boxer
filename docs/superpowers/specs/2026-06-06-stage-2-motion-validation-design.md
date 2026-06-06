# Stage 2 Motion Validation Design

**Goal**
Build a verification-focused Stage 2 page for Pocket Boxer that proves motion permission, acceleration reading, basic punch detection, and fallback charge mode on real devices.

**Scope**
This stage covers:
- motion permission request
- realtime acceleration debug panel
- simplified punch peak detection
- fallback charge mode
- status and result display for calibration and validation

This stage does not cover:
- final homepage flow
- final countdown screen
- final result page styling
- battle integration
- advanced audio system

**Chosen Approach**
Use the existing static single-page scaffold and convert it into a Stage 2 validation console. Keep the structure lightweight so the team can test sensors quickly, tune thresholds, and branch into later gameplay work without refactoring again.

This approach is preferred over a pure sensor sandbox because it already establishes the data flow that later phases need: permission -> motion sampling -> punch score -> result display -> fallback handling.

## Architecture

The page stays as a single validation screen with clear functional blocks:
- motion status
- permission controls
- calibration and punch testing
- live sensor debug data
- fallback charge controls
- result summary

Responsibilities are split by file:
- `index.html`: validation screen structure
- `styles.css`: readable test UI for mobile and desktop
- `src/app.js`: application state, event wiring, mode transitions
- `src/ui.js`: rendering helpers for status, metrics, and score output
- `src/motion.js`: permission request, sensor subscription, magnitude calculation, peak capture, fallback charge scoring
- `src/feedback.js`: lightweight vibration wrapper only

## Data Flow

### Motion Path

1. User taps the permission button.
2. App requests `DeviceMotionEvent` permission if required by the browser.
3. If permission succeeds, motion listening starts.
4. Incoming acceleration data is normalized into:
   - `x`
   - `y`
   - `z`
   - `magnitude`
5. App stores a short rolling peak during the active punch window.
6. Peak value is mapped to a `0-100` score.
7. UI shows the score, raw peak, and validation status.

### Fallback Path

1. If motion permission is denied, unsupported, or manually skipped, the app enters fallback charge mode.
2. User presses and holds a charge control.
3. Charge value increases over time until release or cap.
4. On release, the charge value is converted into a `0-100` score.
5. UI shows the fallback result using the same result block as the motion path.

## Interaction Model

The Stage 2 page should expose these controls:
- `Request Motion Permission`
- `Start Calibration`
- `Start Punch Test`
- `Use Fallback Charge Mode`
- `Hold To Charge`
- `Reset Result`

Expected behavior:
- calibration can run only after motion access is available
- punch test uses a short active sampling window
- fallback mode can be entered at any time
- results are always visible in one shared output panel

## Scoring Model

Stage 2 uses a simplified scoring model intended for validation only.

Acceleration magnitude:

```js
const magnitude = Math.sqrt(x * x + y * y + z * z);
```

Motion score:
- record the highest magnitude during the active punch window
- subtract or compare against a recent baseline
- clamp the result to a reasonable range
- map the normalized value to `0-100`

Fallback score:
- charge increases while the button is held
- value is capped at `100`
- release uses the current charge as the score

The exact formula can stay simple as long as it is:
- easy to tune
- visibly responsive
- stable enough for real-device testing

## Error Handling

The app must clearly report these states:
- motion permission not requested
- motion permission granted
- motion permission denied
- motion API unsupported
- calibration running
- punch window active
- fallback mode active

If motion is unavailable, the UI must show a clear message and keep the app usable through fallback mode instead of leaving the page blocked.

## Success Criteria

Stage 2 is successful when all of the following are true:
- mobile browser can request motion permission
- page shows live `x/y/z/magnitude` values after permission is granted
- obvious punch motion can generate a non-zero score
- result panel shows peak and score clearly
- permission denial or unsupported motion can switch to fallback mode
- fallback hold-and-release can generate a score on desktop or unsupported devices

## Testing Plan

### Manual Browser Checks

- page loads without console-breaking errors
- buttons are clickable
- status text changes as actions occur

### Mobile Motion Checks

- request permission on a supported phone
- confirm live acceleration values change when device moves
- confirm short punch motion produces a score
- confirm repeated light shaking does not always create a high score

### Fallback Checks

- manually switch to fallback mode
- hold charge control and release
- confirm score updates immediately
- confirm fallback can be used without motion support

## Team Handoff Notes

- B can continue inside `src/motion.js` to tune thresholds and scoring
- A can later replace the validation layout with the formal flow UI
- C can consume the score output format for battle integration
- D can test mobile permission differences across devices

## Out Of Scope By Design

To keep Stage 2 focused and safe for a hackathon timeline, do not add:
- multi-screen navigation
- full countdown animation system
- battle HP logic
- online PVP
- complex sound generation
- polished arcade art
