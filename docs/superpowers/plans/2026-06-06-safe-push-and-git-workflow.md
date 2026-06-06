# Safe Push And Git Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a team Git workflow guide, then safely commit and push only the intended Pocket Boxer files without including unrelated legacy deletions.

**Architecture:** Keep the change set intentionally narrow. Create one new workflow doc, stage only the known Pocket Boxer files, verify the staged diff, then commit and push `main` to the configured `origin`.

**Tech Stack:** Markdown, Git

---

### Task 1: Add Team Git Workflow Guide

**Files:**
- Create: `e:\Materials\Hackathon-Phone-game\docs\GIT_WORKFLOW.md`

- [ ] **Step 1: Write the guide**

Document clone, branch creation, daily sync, commit and push flow, PR handoff, merge ownership, conflict handling, freeze rules, and forbidden operations.

- [ ] **Step 2: Verify readability**

Open the file and confirm the sections match a 4-person hackathon workflow.

### Task 2: Prepare A Safe Commit

**Files:**
- Modify: `e:\Materials\Hackathon-Phone-game\.gitignore`
- Modify: `e:\Materials\Hackathon-Phone-game\README.md`
- Modify: `e:\Materials\Hackathon-Phone-game\index.html`
- Create: `e:\Materials\Hackathon-Phone-game\styles.css`
- Create: `e:\Materials\Hackathon-Phone-game\src\app.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\ui.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\motion.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\battle.js`
- Create: `e:\Materials\Hackathon-Phone-game\src\feedback.js`
- Create: `e:\Materials\Hackathon-Phone-game\docs\TASKS.md`
- Create: `e:\Materials\Hackathon-Phone-game\docs\HANDOFF.md`
- Create: `e:\Materials\Hackathon-Phone-game\docs\GIT_WORKFLOW.md`
- Create: `e:\Materials\Hackathon-Phone-game\docs\superpowers\specs\2026-06-06-stage-1-project-setup-design.md`
- Create: `e:\Materials\Hackathon-Phone-game\docs\superpowers\plans\2026-06-06-stage-1-project-setup.md`
- Create: `e:\Materials\Hackathon-Phone-game\DEV_ROADMAP.md`

- [ ] **Step 1: Stage only intended files**

Use `git add -- <pathspecs>` with explicit file paths and the `src` directory.

- [ ] **Step 2: Inspect staged diff**

Run `git diff --cached --name-status` and verify no unrelated deletions are staged.

- [ ] **Step 3: Commit**

Use a single setup commit such as `chore: complete stage 1 project scaffold`.

### Task 3: Push Safely

**Files:**
- No file changes

- [ ] **Step 1: Check branch and remote**

Run `git branch --show-current` and `git remote -v`.

- [ ] **Step 2: Push main**

Run `git push -u origin main`.

- [ ] **Step 3: Report outcome**

If push succeeds, provide next commands for pushing the four collaboration branches. If push fails, report the exact reason and stop before destructive recovery.
