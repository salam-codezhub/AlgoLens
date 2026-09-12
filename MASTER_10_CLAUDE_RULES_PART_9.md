# MASTER_10_CLAUDE_RULES_PART_9.md

Version: 1.0

Project: AlgoLens

Title:
Enterprise Coding Standards, Design Patterns & Scalability Rules

---

# OBJECTIVE

Ensure AlgoLens remains scalable, maintainable, modular and enterprise-ready throughout its lifecycle.

---

# ENGINEERING PRINCIPLES

Always follow

- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren't Gonna Need It)
- Composition over Inheritance
- Single Source of Truth

---

# CODING STANDARDS

Always

- Write readable code.
- Prefer explicit naming.
- Keep functions focused.
- Keep modules small.
- Remove duplicate logic.
- Write reusable utilities.
- Use strict TypeScript.

Never

- Use "any" without justification.
- Create God Classes.
- Write deeply nested logic.
- Ignore compiler warnings.

---

# DESIGN PATTERNS

Use when appropriate

Factory Pattern

- AI Provider Factory
- Parser Factory

Repository Pattern

- SQLite Repository
- Settings Repository

Strategy Pattern

- Complexity Strategies
- Optimization Strategies

Adapter Pattern

- AI Provider Adapters
- Parser Adapters

Observer Pattern

- Event Bus

Command Pattern

- Apply Patch
- Undo Patch

Dependency Injection

- Services
- Providers
- Repositories

---

# DEPENDENCY RULES

Depend on

Interfaces

Never

Concrete implementations

Avoid

Circular dependencies

Always

Inject dependencies

Never instantiate services directly inside UI.

---

# MODULE DESIGN

Each module must have

- Single Responsibility
- Public Interface
- Internal Implementation
- Unit Tests
- Documentation

---

# REFACTORING RULES

Before refactoring

Run tests.

After refactoring

Run tests again.

Never change behavior unless explicitly requested.

Keep commits small.

---

# SCALABILITY RULES

Architecture must support

- Multiple AI Providers
- Multiple Languages
- Multiple Parsers
- Plugin SDK
- Cloud Synchronization
- Team Collaboration
- Future Mobile/Web Dashboard

Avoid hardcoded limits.

---

# EXTENSIBILITY

Every subsystem should be extendable.

Examples

Add new language

↓

Create Parser

↓

Register Parser

↓

Done

Add new AI Provider

↓

Implement Provider Interface

↓

Register Factory

↓

Done

---

# PERFORMANCE ENGINEERING

Profile before optimizing.

Cache

- AST
- Analysis Results
- Prompt Templates
- Configuration

Avoid

- Duplicate Parsing
- Duplicate AI Calls
- Blocking Operations

---

# MEMORY MANAGEMENT

Dispose

- Listeners
- Timers
- File Watchers
- Streams
- Webviews

Prevent memory leaks.

---

# DOCUMENTATION STANDARDS

Every module documents

- Purpose
- Public APIs
- Dependencies
- Limitations
- Examples

Keep documentation synchronized.

---

# CODE QUALITY CHECKLIST

Before merging

✓ Architecture respected

✓ SOLID followed

✓ DRY maintained

✓ Naming consistent

✓ Tests passing

✓ Documentation updated

✓ No dead code

✓ No duplicate logic

✓ No unused imports

✓ Performance acceptable

---

# DEFINITION OF DONE

Implementation is complete only if

- Maintainable
- Testable
- Reusable
- Scalable
- Secure
- Documented
- Production Ready

End of MASTER_10_CLAUDE_RULES_PART_9.md
