# Stage 2 Motion Score Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tune Stage 2 motion scoring so iPhone sensor spikes no longer create unrealistic punch scores.

**Architecture:** Keep the Stage 2 validation console unchanged and limit the change to `src/motion.js`. Add smoothed magnitude tracking, use smoothed peak delta for scoring, then apply a minimum threshold and capped score window before mapping to `0-100`.

**Tech Stack:** JavaScript, DeviceMotionEvent

---

### Task 1: Replace Direct Peak Scoring

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\src\motion.js`

- [ ] **Step 1: Add smoothed motion state**

Track a smoothed magnitude value alongside the raw magnitude so debug display and scoring can use different representations.

- [ ] **Step 2: Change peak tracking**

During punch detection, keep the highest smoothed magnitude and compute peak delta from that value instead of raw single-frame magnitude.

- [ ] **Step 3: Replace score mapping**

Apply:
- smoothing
- minimum threshold around `8`
- capped usable range around `52`
- final mapping to `0-100`

- [ ] **Step 4: Preserve UI compatibility**

Keep the result shape and status flow unchanged so the current validation page still works.

### Task 2: Verify The Tuning

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\docs\superpowers\plans\2026-06-06-stage-2-motion-score-tuning.md`

- [ ] **Step 1: Run diagnostics**

Check `src/motion.js` for syntax or language errors.

- [ ] **Step 2: Review diff scope**

Confirm only score-tuning logic changed.

- [ ] **Step 3: Retest on iPhone**

Validate these expected ranges:
- idle near baseline with low score
- normal short punch in mid-score range
- strong punch near high-score range
