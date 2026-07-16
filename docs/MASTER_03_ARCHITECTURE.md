
# MASTER_03_ARCHITECTURE.md

# AlgoLens Architecture

## Purpose
This document defines the software architecture for AlgoLens.

## Architectural Style
- Modular Monorepo
- Layered Architecture
- Clean Architecture
- Plugin-based analyzers
- Event-driven communication

## Layers

Presentation
- VS Code Extension
- React Webview UI

Application
- Command Handlers
- Use Cases
- Orchestrators

Domain
- Analysis Models
- Optimization Models
- Interfaces

Infrastructure
- AI Providers
- Parser
- SQLite
- Export Services

## Folder Structure

```text
AlgoLens/
├── apps/
│   ├── extension/
│   └── webview/
├── packages/
│   ├── ai/
│   ├── analyzer/
│   ├── parser/
│   ├── optimizer/
│   ├── runtime/
│   ├── security/
│   ├── documentation/
│   ├── visualization/
│   ├── storage/
│   ├── shared/
│   └── ui/
├── docs/
├── tests/
└── scripts/
```

## Core Request Flow

User edits code

↓

Extension detects change

↓

Workspace Context Engine

↓

Language Detection

↓

AST Parser

↓

Static Analyzer

↓

Complexity Engine

↓

Runtime Estimator

↓

Memory Analyzer

↓

Security Scanner

↓

Bug Detector

↓

Code Smell Engine

↓

AI Optimization Engine

↓

Documentation Generator

↓

Visualization Engine

↓

Dashboard Update

## Event Bus

Events:
- WorkspaceOpened
- FileChanged
- AnalysisStarted
- AnalysisCompleted
- OptimizationRequested
- OptimizationApplied
- ReportGenerated
- ExportCompleted

Modules communicate only through events or interfaces.

## Dependency Rules

- UI never talks directly to Parser.
- Parser never depends on React.
- AI Provider only through interface.
- Business logic never imports VS Code API directly.

## AI Provider Interface

Every provider implements:
- chat()
- analyze()
- optimize()
- explain()
- stream()

Supported:
- OpenAI
- Claude
- Gemini
- DeepSeek
- Qwen

## Parser Interface

Each language parser returns:
- AST
- Symbols
- Imports
- Functions
- Classes
- Loops
- Variables

## Analyzer Pipeline

Parse
→ Analyze
→ Detect Algorithm
→ Complexity
→ Runtime Estimate
→ Memory
→ Security
→ Bugs
→ Smells
→ Suggestions

## Optimization Pipeline

Analyze
→ AI Recommendation
→ Risk Score
→ Patch
→ Preview
→ Accept / Reject
→ Apply
→ Re-analyze

## Database

SQLite stores:
- History
- Reports
- Benchmarks
- User Settings
- AI Conversations
- Optimization History

## Security Principles

- No API keys in source
- Environment variables only
- Sandboxed execution
- Validate all input
- Never execute arbitrary code without isolation

## Definition of Done

Architecture is complete only if:
- Loose coupling
- High cohesion
- Type-safe
- Testable
- Extensible
- No circular dependencies
- Multi-provider AI ready
- Multi-language ready

End of MASTER_03_ARCHITECTURE.md
