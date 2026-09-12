# PROJECT_STATE.md — AlgoLens Checkpoint

_Keep this concise — see git log for full history._

## Status

- **Latest completed phase:** 23 (Time Complexity Engine) — committed
- **Current phase:** 24 (Space Complexity Engine) — not yet started
- **Total phases:** 40

## Repo facts

- Monorepo: apps/{extension,webview}, packages/{ai,analyzer,core,parser,shared,ui,...}
- Package manager: npm workspaces
- Full verification pipeline: npx tsc -b (strict), npm run build, npx eslint ., npx prettier --check ., npm audit
- PROGRESS.md (separate file) also tracks phase completion in table form - keep both in sync.

## Completed phases summary

1-6: Repo/monorepo/npm workspaces/TypeScript/lint/build scaffolding.
7: VS Code extension scaffold.
8-11: React app, Tailwind, shadcn/ui, Theme Engine.
12-15: Activity Bar, Sidebar, Dashboard, shared state.
16: AI Provider Architecture (packages/ai).
17: Prompt Management System.
18: Workspace Context Engine.
19: Language Detection (C/C++/Java/Python/JS/TS).
20: AST Parsing Engine (Babel + tree-sitter).
21: Static Analysis Engine (loops, nesting, recursion, unused vars/imports, dead code, cyclomatic complexity, maintainability index, AnalysisResultStore).
22: Algorithm Detection (packages/analyzer/src/algorithms) - 14 algorithms, signal-based confidence scoring.
23: Time Complexity Engine (packages/analyzer/src/time-complexity) - estimateTimeComplexity() prefers a confidently-detected Phase 22 algorithm's known textbook complexity (algorithm-complexity-table.ts), falls back to structural estimation (structural-estimator.ts: loop nesting depth, recursion shape - branching/halving/linear) otherwise. Verified functionally correct: binary search -> O(1)/O(log n)/O(log n) via algorithm table; nested loop -> O(n^2), naive recursion -> O(n)/O(2^n), constant function -> O(1), all via structural fallback.

## Known issues

- CLAUDE.md does not exist inside this repo - only in the separate ALGOLENS_DOCS specification repo. Not yet copied in.
- This sandbox environment has reset multiple times during development. Recovery works via restoring the last delivered zip - see CONTEXT_RULES.md's recovery procedure. Lesson learned and now applied: commit and deliver a zip promptly after each phase's verification passes, rather than leaving verified work uncommitted across turns.
- packages/analyzer's Halstead Volume uses a text-pattern operator/operand classifier, not full per-language semantic classification - documented as intentional in the code.
- Algorithm detection (Phase 22) is whole-file-scoped, not per-function.

## Next step

Start Phase 24 (Space Complexity Engine) per MASTER_02_PHASES.md - read only that phase's spec section from the docs repo, not the whole file. Do not start without explicit instruction.
