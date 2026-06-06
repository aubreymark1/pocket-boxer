# Pocket Boxer Handoff Rules

## Main Rule

Keep `main` always demo-safe.
Do not push unstable work directly to `main`.

## Sync Rule

Before starting work:

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

## Merge Rule

- Self-test before pushing
- Open a PR or send the diff to the integration owner
- Let the integration owner merge into `main`

## Interface Direction

Stage 1 only locks file boundaries.
Stage 2 can define concrete APIs for scoring and battle flow.
