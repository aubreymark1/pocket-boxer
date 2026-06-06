# Stage 1 Project Setup Design

**Goal**
Create a clean, Git-ready collaboration scaffold for Pocket Boxer so four people can start parallel work immediately.

**Scope**
This stage covers project structure, placeholder frontend files, shared collaboration docs, and Git initialization with the existing GitHub remote.
It does not implement gameplay, scoring, battle logic, or sensor integration.

**Chosen Approach**
Use a minimal static web scaffold with small source modules and collaboration docs.
This is the fastest option, keeps ownership boundaries clear, and avoids over-design before motion validation starts.

**Structure**
- `index.html`: base entry point
- `styles.css`: visual shell for local sanity checks
- `src/app.js`: bootstraps the app shell
- `src/ui.js`: UI boot placeholder
- `src/motion.js`: motion module placeholder
- `src/battle.js`: battle module placeholder
- `src/feedback.js`: feedback module placeholder
- `README.md`: quick project overview
- `docs/TASKS.md`: team split
- `docs/HANDOFF.md`: merge and sync rules

**Success Criteria**
- Files and folders exist locally
- Browser entry point loads without syntax errors
- Git is initialized on `main`
- Remote points to `https://github.com/aubreymark1/pocket-boxer.git`
- Team members can start Stage 2 work from this scaffold
