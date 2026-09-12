
# MASTER_10_CLAUDE_RULES_PART_8.md

# Git Workflow, Multi-Session Development & Claude Response Rules

## Objective
Support long-term, structured development.

## Git Workflow
Branches:
- main
- develop
- feature/*
- release/*
- hotfix/*

Rules:
- Never commit directly to main.
- One feature per branch.
- Small meaningful commits.
- Rebase before merge.

## Commit Format
type(scope): description

Examples:
- feat(analyzer): add complexity engine
- fix(parser): handle invalid syntax
- docs(api): update contracts

## Pull Requests
Include:
- Summary
- Changed files
- Tests
- Risks
- Rollback plan

## Multi-Session Workflow
At every session:
1. Read CLAUDE.md
2. Read MASTER docs
3. Find current phase
4. Continue only that phase

## Context Recovery
If context is lost:
- Read MASTER_00 to MASTER_10
- Resume latest completed phase
- Never regenerate unchanged code

## Token Optimization
- Reuse interfaces
- Reuse types
- Generate only requested files
- Avoid duplicate explanations

## Standard Response
1. Objective
2. Files Created
3. Files Modified
4. Code
5. Explanation
6. Testing
7. Remaining Tasks

## Phase Completion
A phase finishes only when:
- Build passes
- Tests pass
- Docs updated
- User approves

## End Session Checklist
- Save progress
- Update docs
- Mention next phase
- Verify build

## Final Checklist
- Architecture respected
- Security maintained
- Performance acceptable
- Tests passing

End of PART 8
