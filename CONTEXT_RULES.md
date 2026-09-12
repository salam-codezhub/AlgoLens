# CONTEXT_RULES.md — Context Management Policy

This file defines how future work sessions on AlgoLens should manage context/usage. It supplements — and does not duplicate — `CLAUDE.md`.

**Note on CLAUDE.md:** `CLAUDE.md` was not found inside this repository (`/AlgoLens`) as of this writing. It exists only in the separate `ALGOLENS_DOCS` specification repository this project was originally built from. This file assumes `CLAUDE.md`'s rules (coding standards, folder rules, AI rules) are authoritative wherever that file lives, and treats it as the permanent instruction source once present here. This gap should be resolved (see PROJECT_STATE.md's Known Issues) rather than papered over.

## Core principle

Read only what the current task needs. Never re-derive the whole project from scratch when a checkpoint already exists.

## File roles

- **CLAUDE.md** — permanent project instructions. Read once per session if not already in context. Never rewritten by routine phase work.
- **PROJECT_STATE.md** — the current checkpoint: latest completed phase, in-progress work, known issues, next step. Read first, every session.
- **MASTER_02_PHASES.md** (docs repo) — only the section for the phase actually being worked on gets read, not the whole file.
- Everything else in the docs repo — read only the specific section needed, not the whole document.

## Session start checklist

1. Read `PROJECT_STATE.md`.
2. Read `CLAUDE.md` if not already in context this session.
3. Read `CONTEXT_RULES.md` (this file) if not already in context this session.
4. Identify the current task from `PROJECT_STATE.md`'s "Next Step."
5. Read only the spec for that specific phase/task.
6. Inspect only the source files the task will touch.

## Rules for ongoing work

- Do not reread the entire repository to "get oriented" — `PROJECT_STATE.md` is what orientation is for.
- Do not reread completed phases' source unless the current task explicitly depends on or modifies them.
- Before modifying any file, view its current content first.
- Never rebuild or recreate existing functionality without evidence it's missing or broken. If something appears missing after an environment reset, verify first (check git log, check the file tree) — report what's actually missing rather than assuming.
- Preserve existing working code. Prefer the smallest correct change over a rewrite.
- Do not start a new phase without explicit instruction.

## Updating PROJECT_STATE.md

Update after every meaningful milestone. Keep entries concise. Long historical detail belongs in git commit messages.

## Recovering from environment resets

This has happened multiple times during development. Recovery procedure:

1. Do not assume work was lost. Check `/mnt/user-data/outputs/` for the most recently delivered zip first.
2. Restore from the most recent complete, verified zip (it retains full git history).
3. Reinstall dependencies (`npm install`) — `node_modules` is not in the zip.
4. Verify the restored state (`git log`, `git status`) before resuming.
5. Continue from `PROJECT_STATE.md`'s "Next Step" — do not redo already-committed phases. If work existed only in an in-progress session (not yet committed) when the reset happened, it must be redone, but only that uncommitted work.
