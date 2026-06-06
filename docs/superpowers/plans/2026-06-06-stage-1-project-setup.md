# Stage 1 Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Git-ready Pocket Boxer project scaffold with shared docs and source placeholders for four-person parallel work.

**Architecture:** Use a small static web entry point plus separate source modules for app flow, motion, battle, and feedback. Add collaboration docs and initialize Git so the team can branch cleanly from `main`.

**Tech Stack:** HTML, CSS, JavaScript, Markdown, Git

---

### Task 1: Create Base Project Files

**Files:**
- Create: `e:\Materials\Hackathon-Phone-game\index.html`
- Create: `e:\Materials\Hackathon-Phone-game\styles.css`
- Create: `e:\Materials\Hackathon-Phone-game\src\app.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\ui.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\motion.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\battle.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\feedback.js`

- [ ] **Step 1: Create the source directory**

Run: `New-Item -ItemType Directory -Path e:\Materials\Hackathon-Phone-game\src`
Expected: directory created or already exists

- [ ] **Step 2: Add the base HTML shell**

Create `index.html` with a title, a simple status layout, and a module script tag for `src/app.js`.

- [ ] **Step 3: Add the base stylesheet**

Create `styles.css` with a dark arcade-like layout for quick local verification.

- [ ] **Step 4: Add minimal JS modules**

Create separate placeholder modules for UI, motion, battle, and feedback.

- [ ] **Step 5: Verify the file set**

Run: `Get-ChildItem e:\Materials\Hackathon-Phone-game -Recurse`
Expected: all files exist in the expected directories

### Task 2: Create Collaboration Docs

**Files:**
- Create: `e:\Materials\Hackathon-Phone-game\README.md`
- Create: `e:\Materials\Hackathon-Phone-game\docs\TASKS.md`
- Create: `e:\Materials\Hackathon-Phone-game\docs\HANDOFF.md`

- [ ] **Step 1: Create the docs directory**

Run: `New-Item -ItemType Directory -Path e:\Materials\Hackathon-Phone-game\docs`
Expected: directory created or already exists

- [ ] **Step 2: Add README**

Document the project purpose, Stage 1 status, branch suggestions, and next step.

- [ ] **Step 3: Add task ownership doc**

Document the 4-person split and file ownership.

- [ ] **Step 4: Add handoff doc**

Document sync and merge rules for the team.

- [ ] **Step 5: Verify readability**

Open the markdown files and confirm the sections are present and specific.

### Task 3: Initialize Git

**Files:**
- Create: `e:\Materials\Hackathon-Phone-game\.gitignore`

- [ ] **Step 1: Add `.gitignore`**

Include common temporary files and logs.

- [ ] **Step 2: Initialize the repository**

Run: `git init`
Expected: repository initialized in `e:\Materials\Hackathon-Phone-game\.git`

- [ ] **Step 3: Rename the branch to main**

Run: `git branch -M main`
Expected: current branch is `main`

- [ ] **Step 4: Add the GitHub remote**

Run: `git remote add origin https://github.com/aubreymark1/pocket-boxer.git`
Expected: remote named `origin` exists

- [ ] **Step 5: Verify Git status**

Run: `git status`
Expected: new files are tracked or untracked and branch is `main`
