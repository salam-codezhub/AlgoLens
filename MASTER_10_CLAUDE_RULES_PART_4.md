# MASTER_10_CLAUDE_RULES_PART_4.md

# AI Integration, AST & Analysis Rules

## Objective
Ensure AI features are deterministic, explainable and safe.

## AI Workflow
User Request
-> Workspace Context
-> Language Detection
-> AST Parsing
-> Static Analysis
-> Complexity
-> Runtime Estimate
-> Memory Analysis
-> Security Scan
-> Prompt Builder
-> AI Response
-> Validation
-> Patch
-> User Approval
-> Apply

## AI Provider Rules
- Provider agnostic
- Support Claude, OpenAI, Gemini, DeepSeek, Qwen
- Retry transient failures
- Track token usage
- Timeouts required

## Prompt Rules
Include:
- Language
- Current file
- Workspace summary
- AST summary
- Imports
- Functions
- Classes
- Complexity
- Runtime estimate
- User goal

## AST Rules
Extract:
- Functions
- Classes
- Variables
- Loops
- Recursion
- Imports
- Dependencies

Never rely only on regex.

## Static Analysis
Detect:
- Dead code
- Duplicate logic
- Unused variables
- Deep nesting
- Long methods
- High cyclomatic complexity

## Algorithm Detection
Support:
- Binary Search
- BFS/DFS
- Merge Sort
- Quick Sort
- Heap
- Trie
- Sliding Window
- DP
- Greedy
- Two Pointer

## Complexity Rules
Return:
- Best
- Average
- Worst
- Space complexity
- Reasoning

## Runtime Rules
Differentiate:
- Estimated runtime
- Measured runtime

Never confuse them.

## Memory Rules
Estimate:
- Heap
- Stack
- Peak memory
- Growth trend

## Security Rules
Detect:
- SQL Injection
- XSS
- Command Injection
- Hardcoded secrets
- Weak crypto

## Optimization Rules
Always:
- Preserve behavior
- Explain trade-offs
- Produce unified diff
- Show confidence
- Show risk

## Confidence
95-100 Verified
80-94 Strong
60-79 Review
<60 Hypothesis

## Hallucination Prevention
Never invent:
- APIs
- Benchmarks
- Security findings
- Parser output

## Quality Gate
- AST complete
- Static analysis complete
- Confidence shown
- Risk shown
- Patch validated

End of PART 4
