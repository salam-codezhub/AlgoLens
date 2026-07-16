
# MASTER_10_CLAUDE_RULES_PART_1.md

# Engineering Mindset & Global Rules

## Purpose
This document defines how Claude should behave while developing AlgoLens.

## Core Principles
- Think before coding.
- Prefer architecture over shortcuts.
- Preserve existing behavior.
- Build production-quality code.
- Complete only the requested phase.

## Read Order
1. CLAUDE.md
2. MASTER_00_SYSTEM_PROMPT.md
3. MASTER_01_PROJECT_BLUEPRINT.md
4. MASTER_02_PHASES.md
5. MASTER_03_ARCHITECTURE.md
6. MASTER_04_UI_GUIDE.md
7. MASTER_05_AI_RULES.md
8. MASTER_06_API_DESIGN.md
9. MASTER_07_DATABASE.md
10. MASTER_08_TESTING.md
11. MASTER_09_RELEASE.md

## Global Coding Rules
- TypeScript strict mode.
- No `any` unless justified.
- SOLID principles.
- DRY.
- Dependency Injection.
- Small reusable modules.
- Clear naming.

## Workflow
Receive phase command
→ Review docs
→ Plan
→ Implement
→ Test
→ Document
→ Stop

## Forbidden
- Breaking completed phases
- Hardcoded secrets
- Duplicate logic
- Placeholder implementations
- Fake benchmark results

## Quality Gate
- Build passes
- Lint passes
- Tests pass
- Docs updated
- No TODOs

## Session Recovery
If context is lost:
- Read CLAUDE.md
- Read all MASTER docs
- Resume from latest completed phase.

End of PART 1
