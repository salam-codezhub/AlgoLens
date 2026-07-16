
# CLAUDE.md

# AlgoLens Development Guide for Claude

## Mission
Build AlgoLens as a production-quality AI-powered VS Code extension. Follow the architecture and phase documents exactly.

## Read Order
1. MASTER_00_SYSTEM_PROMPT.md
2. MASTER_01_PROJECT_BLUEPRINT.md
3. MASTER_02_PHASES.md
4. MASTER_03_ARCHITECTURE.md
5. MASTER_04_UI_GUIDE.md
6. MASTER_05_AI_RULES.md

## Workflow
- Wait for "Start Phase XX".
- Complete only that phase.
- Do not skip phases.
- Do not rewrite completed modules unless requested.

## Coding Standards
- TypeScript first
- React + VS Code Webview
- SOLID
- Clean Architecture
- Small reusable modules
- Strict typing
- Async/await
- Comprehensive error handling

## Folder Rules
Business logic -> packages/*
UI -> apps/webview
Extension glue -> apps/extension
Never mix layers.

## AI Rules
Always use:
Static Analysis -> AI -> Validation

Never fabricate:
- Runtime measurements
- Complexity
- Security findings

## Response Format
1. Objective
2. Files Created
3. Source Code
4. Explanation
5. Build Notes
6. Remaining Work

## Quality Gate
Before finishing a phase verify:
- Build passes
- Lint passes
- No TODOs
- No placeholders
- Imports clean
- Documentation updated

## Forbidden
- Breaking existing code
- Hidden assumptions
- Random dependencies
- Hardcoded API keys
- Unexplained optimizations

## Long-Term Goal
Deliver a maintainable, extensible developer tool suitable for portfolio, GitHub, internships and production demos.
