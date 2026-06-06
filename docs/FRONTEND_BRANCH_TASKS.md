# Frontend Branch Tasks

## Goal

Three frontend teammates work in parallel without colliding on the same files.
The current motion validation and iPhone sensor path are already working. Frontend work must now wrap that logic into a playable Stage 3 flow without breaking `src/motion.js`.

## Shared Rules

- Work from the latest `main`
- Do not modify `src/motion.js` unless explicitly approved
- Keep `main` demo-safe
- Commit small and push often
- Tell the integration owner before changing another branch owner's file

## Branch 1: `feat/app-flow`

**Owner**
Frontend teammate A

**Primary Files**
- `index.html`
- `src/app.js`

**What To Build**
- Page state machine for:
  - home
  - safety
  - calibrating
  - countdown
  - punch
  - result
- Primary navigation buttons
- Flow control between screens
- Wiring existing motion actions into the formal Stage 3 flow

**Must Not Do**
- Do not rewrite score logic
- Do not redesign all visual styling alone
- Do not add battle internals

**Acceptance Criteria**
- Home can enter the punch-test flow
- Safety confirmation is required once per run
- Calibration leads into countdown
- Countdown leads into punch sampling
- Punch result leads into a result screen
- Replay and back-home actions work without reload

## Branch 2: `feat/ui-render`

**Owner**
Frontend teammate B

**Primary Files**
- `src/ui.js`

**Secondary Files**
- `index.html` only if coordinated with Branch 1 owner

**What To Build**
- Render each Stage 3 screen cleanly from app state
- Present score, peak, delta, and status content clearly
- Build reusable rendering sections for:
  - hero/title area
  - safety copy
  - calibration copy
  - countdown text
  - punch prompt area
  - result summary
- Keep fallback mode messaging visible and understandable

**Must Not Do**
- Do not own state machine transitions
- Do not rewrite global CSS structure without coordination
- Do not change motion APIs

**Acceptance Criteria**
- Every Stage 3 screen has distinct content
- Result screen clearly shows score and summary
- `100+` score messaging is visible when triggered
- UI rendering remains compatible with current app state and motion result shape

## Branch 3: `feat/ui-polish`

**Owner**
Frontend teammate C

**Primary Files**
- `styles.css`

**Secondary Files**
- `index.html` only if coordinated with Branch 1 owner

**What To Build**
- Mobile-first layout polish
- Button hierarchy and visual consistency
- Light animation only:
  - button press feedback
  - screen fade/slide transitions
  - countdown emphasis
  - result emphasis
- Style system for:
  - title
  - cards/panels
  - action buttons
  - score highlight
  - warning text

**Must Not Do**
- Do not add heavy Canvas systems
- Do not add complex particle effects
- Do not introduce new dependencies
- Do not break current iPhone Safari testability

**Acceptance Criteria**
- The flow looks like a real game rather than a debug console
- Score and CTA buttons are obvious on phone screens
- Motion validation still works on iPhone after styling changes
- Animations are light and do not block interaction

## Git Commands

Each teammate starts from fresh `main`:

```bash
git checkout main
git pull origin main
```

Then switch to the assigned branch:

```bash
git checkout feat/app-flow
git pull origin feat/app-flow
```

Replace the branch name for the other two teammates.

## Merge Order

Recommended merge order:
1. `feat/app-flow`
2. `feat/ui-render`
3. `feat/ui-polish`

This keeps structure first, rendering second, polish last.

## Final Rule

Wrap the existing sensor logic in a clean game flow. Do not re-open the motion algorithm unless the integration owner asks for it.
