
# MASTER_10_CLAUDE_RULES_PART_5.md

# Storage, Event Bus & Performance Rules

## Objective
Build a scalable and maintainable infrastructure layer.

## Storage Rules
- Use repository pattern.
- Never access SQLite directly from UI.
- Validate all inputs.
- Use transactions for multi-step writes.

## Secret Management
- Store API keys in VS Code SecretStorage.
- Never write secrets to logs or SQLite.

## Cache Strategy
Cache:
- AST
- Prompt templates
- Analysis results
- Settings

Invalidate cache on file changes.

## Event Bus
Core Events:
- WorkspaceOpened
- FileChanged
- AnalysisStarted
- AnalysisCompleted
- OptimizationApplied
- ReportGenerated

Events must be strongly typed.

## Export Engine
Support:
- Markdown
- HTML
- PDF
- JSON

Exports should be reproducible.

## Visualization Rules
Provide:
- Complexity charts
- Runtime charts
- Memory charts
- Dependency graphs

Never block the UI while rendering.

## Benchmark Rules
Record:
- Input size
- Estimated runtime
- Measured runtime (if available)
- Memory estimate

Clearly label estimates vs measurements.

## Performance Rules
- Lazy load heavy modules.
- Debounce analysis.
- Reuse parsed AST.
- Batch file system events.
- Avoid duplicate AI requests.

## Logging
Levels:
- debug
- info
- warn
- error

Redact secrets before logging.

## Definition of Done
- Repository abstraction used
- Typed events
- Cached expensive operations
- Secure secret handling
- Export pipeline verified

End of PART 5
