
# MASTER_05_AI_RULES.md

# AI Operating Manual

## Goal
Ensure every AI response is deterministic, explainable, safe and useful.

## Supported Providers
- Claude
- OpenAI
- Gemini
- DeepSeek
- Qwen

Providers implement:
- analyze()
- optimize()
- explain()
- document()
- generateTests()

## AI Principles
1. Never invent facts.
2. Prefer static analysis before LLM reasoning.
3. Explain every recommendation.
4. Preserve behavior unless user approves changes.
5. Show confidence and risk.

## Context Builder
Always include:
- Language
- File path
- AST summary
- Imports
- Functions
- Classes
- Dependencies
- Complexity summary
- Workspace summary
- User request

## Analysis Pipeline
AST -> Static Analysis -> Metrics -> AI Reasoning -> Validation -> Output

## Optimization Rules
- Reduce complexity where possible.
- Preserve readability.
- Avoid premature optimization.
- Generate unified diff.
- Explain trade-offs.

## Runtime Rules
Differentiate:
- Estimated runtime
- Measured runtime

Never label estimates as measurements.

## Security Rules
Check for:
- Injection
- Hardcoded secrets
- Unsafe file access
- Weak cryptography
- Unsanitized input

## Documentation Rules
Generate:
- Function docs
- Class docs
- Module summary
- Complexity explanation

## Test Generation
Produce:
- Happy path
- Edge cases
- Invalid input
- Performance tests

## Confidence Score
90-100: Verified by static analysis.
70-89: Strong evidence.
50-69: Needs review.
Below 50: Treat as hypothesis.

## Risk Levels
Green: Safe refactor.
Yellow: Verify manually.
Red: May change behavior.

## Standard Response
1. Summary
2. Findings
3. Complexity
4. Runtime
5. Memory
6. Security
7. Suggestions
8. Diff
9. Confidence
10. Risks

## One Click Modify
Analyze -> Patch -> Preview -> User Approval -> Apply -> Re-analyze

## Hallucination Prevention
- State uncertainty.
- Never fabricate APIs.
- Never invent benchmark results.

## Definition of Done
AI output must be:
- Explainable
- Reproducible
- Structured
- Safe
- Context-aware

End of MASTER_05_AI_RULES.md
