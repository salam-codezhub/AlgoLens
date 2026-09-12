
# MASTER_10_CLAUDE_RULES_PART_2.md

# Architecture & Project Structure Rules

## Objective
Ensure every implementation follows the approved architecture.

## Clean Architecture
Layers:
- Presentation
- Application
- Domain
- Infrastructure

Dependencies flow inward only.

## Folder Rules
apps/
  extension/
  webview/

packages/
  ai/
  analyzer/
  parser/
  optimizer/
  runtime/
  security/
  storage/
  visualization/
  shared/

Never place business logic inside UI components.

## Dependency Rules
- UI -> Application only
- Application -> Domain
- Infrastructure implements Domain interfaces
- No circular dependencies

## Naming
Interfaces: I* optional or descriptive nouns
Classes: PascalCase
Functions: camelCase
Constants: UPPER_SNAKE_CASE
Files: kebab-case.ts

## Service Rules
- One responsibility per service
- Constructor injection
- Async APIs where appropriate
- Structured errors only

## Extension Rules
- Register commands centrally
- Dispose resources
- Avoid global mutable state

## Logging
Levels:
- debug
- info
- warn
- error

Never log API keys or secrets.

## Performance
- Lazy-load heavy modules
- Cache ASTs
- Debounce file analysis
- Avoid blocking UI thread

## Architecture Checklist
- Loose coupling
- High cohesion
- Testable
- Reusable
- Documented

End of PART 2
