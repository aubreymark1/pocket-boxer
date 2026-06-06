# Stage 2 Motion Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Stage 2 validation console for Pocket Boxer with motion permission, live acceleration data, basic punch scoring, and fallback charge mode.

**Architecture:** Convert the current scaffold into a single validation screen that exposes sensor state, calibration, punch testing, live metrics, and fallback controls. Keep logic split between `app.js` for state wiring, `ui.js` for rendering, `motion.js` for sensing and scoring, and `feedback.js` for lightweight vibration.

**Tech Stack:** HTML, CSS, JavaScript, DeviceMotionEvent, Vibration API

---

### Task 1: Build The Validation Screen

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\index.html`
- Modify: `e:\Materials\Hackathon-Phone-game\styles.css`

- [ ] **Step 1: Replace the placeholder cards**

Build a single-page validation layout with sections for status, controls, live metrics, fallback controls, and results.

- [ ] **Step 2: Add mobile-friendly styling**

Make buttons, metrics, and result panels large enough for real-device testing.

- [ ] **Step 3: Verify static load**

Open the page and confirm the new structure renders without broken layout.

### Task 2: Wire App State And Rendering

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\src\app.js`
- Modify: `e:\Materials\Hackathon-Phone-game\src\ui.js`

- [ ] **Step 1: Define app state**

Track permission status, validation mode, live metrics, calibration, punch test state, fallback charge state, and the latest result.

- [ ] **Step 2: Attach button events**

Connect UI controls to motion actions and state transitions.

- [ ] **Step 3: Render state updates**

Update labels, metrics, button states, and result output whenever app state changes.

### Task 3: Implement Motion Validation Logic

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\src\motion.js`
- Modify: `e:\Materials\Hackathon-Phone-game\src\feedback.js`

- [ ] **Step 1: Add motion capability helpers**

Implement support detection, permission request, and sensor subscription helpers.

- [ ] **Step 2: Add calibration and punch scoring**

Capture a short baseline and compute a simplified 0-100 score from peak motion magnitude.

- [ ] **Step 3: Add fallback charge mode**

Implement hold-to-charge scoring that works without motion support.

- [ ] **Step 4: Add lightweight vibration**

Trigger optional vibration for punch start and score completion when supported.

### Task 4: Verify The Stage 2 Build

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\docs\superpowers\plans\2026-06-06-stage-2-motion-validation.md`

- [ ] **Step 1: Run diagnostics**

Check the edited HTML, CSS, and JavaScript files for syntax or language diagnostics.

- [ ] **Step 2: Verify Git diff scope**

Confirm only the intended Stage 2 files changed.

- [ ] **Step 3: Summarize manual test steps**

Record the exact checks for phone permission, live data updates, punch scoring, and fallback scoring.
