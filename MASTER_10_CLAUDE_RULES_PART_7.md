
# MASTER_10_CLAUDE_RULES_PART_7.md

# Testing, Validation & Quality Assurance Rules

## Objective
Ensure every feature is tested, validated and production-ready.

## Testing Philosophy
- Never merge untested code.
- Prefer automated tests.
- Keep tests deterministic.

## Test Levels
### Unit
- Functions
- Services
- Utilities
- Hooks
- Components

### Integration
Parser -> Analyzer -> Runtime -> Optimizer -> AI -> Export

### End-to-End
Open Project -> Analyze -> Optimize -> Apply Patch -> Export

## AI Validation
Pipeline:
Prompt -> Response -> JSON Validation -> Static Analysis -> Confidence -> Risk

Never trust raw AI output.

## Benchmark Rules
Record:
- Language
- File size
- Input size
- Estimated runtime
- Measured runtime
- Memory estimate

Always label estimates separately.

## Documentation Rules
Each module documents:
- Purpose
- Responsibilities
- Public APIs
- Dependencies
- Examples

## Code Review Checklist
- Build passes
- TypeScript passes
- ESLint passes
- Tests pass
- No dead code
- No duplicate logic
- Docs updated

## Quality Gates
- Correctness
- Performance
- Readability
- Maintainability
- Security
- Scalability

## Release Criteria
- Tests pass
- Benchmarks reviewed
- VSIX builds
- No critical issues

## Definition of Done
Implemented + Tested + Reviewed + Documented + Production Ready

End of PART 7
