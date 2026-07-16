
# MASTER_08_TESTING.md

Version: 1.0

Project: AlgoLens

## Purpose
Define the complete testing strategy for AlgoLens.

---

# 1. Testing Philosophy

- Testing is mandatory.
- Every feature should be verifiable.
- Never merge untested code.
- Prefer automated tests over manual tests.

# 2. Testing Pyramid

- 70% Unit Tests
- 20% Integration Tests
- 10% End-to-End Tests

# 3. Unit Testing

Modules:
- AI
- Analyzer
- Parser
- Runtime
- Security
- Storage
- Visualization
- Documentation

# 4. Parser Tests

Verify:
- Language Detection
- AST Generation
- Imports
- Functions
- Variables
- Loops
- Classes
- Comments
- Malformed Code

# 5. Analyzer Tests

Verify:
- Time Complexity
- Space Complexity
- Cyclomatic Complexity
- Algorithm Detection
- Dead Code
- Unused Variables
- Code Smells
- Maintainability

# 6. Runtime Tests

Verify:
- Estimated Runtime
- Benchmark Results
- Scaling
- Invalid Inputs
- Timeout Handling

# 7. Memory Tests

Verify:
- Heap
- Stack
- Peak Memory
- Growth Trends

# 8. Security Tests

Detect:
- SQL Injection
- XSS
- Hardcoded Secrets
- Unsafe File Access
- Weak Cryptography
- Command Injection

# 9. AI Tests

Mock Providers:
- Claude
- OpenAI
- Gemini
- DeepSeek
- Qwen

Verify:
- Prompt Rendering
- Streaming
- Retries
- Fallback
- Response Parsing

# 10. UI Tests

- Dashboard
- Analyzer
- AI Chat
- Reports
- Charts
- Theme Switching
- Keyboard Navigation

# 11. VS Code Extension Tests

- Activation
- Commands
- Webview
- File Watchers
- Settings
- Notifications

# 12. Integration Pipeline

Parser
→ Analyzer
→ Runtime
→ Optimizer
→ Documentation
→ Export

# 13. Performance Tests

Measure:
- Startup Time
- Analysis Time
- Memory Usage
- Bundle Size

# 14. Regression Tests

Prevent:
- Broken Features
- Incorrect Analysis
- UI Regressions
- Performance Regressions

# 15. Test Datasets

- Small Files
- Large Projects
- Open Source Repositories
- Competitive Programming Problems

# 16. Continuous Integration

Run Automatically:
- Type Check
- Lint
- Unit Tests
- Integration Tests
- Build

# 17. Coverage Targets

- Overall ≥ 80%
- Core Modules ≥ 90%
- AI ≥ 80%
- UI ≥ 70%

# 18. Definition of Done

- Build passes
- Tests pass
- Coverage targets met
- No critical bugs
- Extension loads successfully

End of MASTER_08_TESTING.md
