# AlgoLens

**Analyze. Optimize. Accelerate.**

AlgoLens is an AI-powered Visual Studio Code extension that helps developers understand, optimize, benchmark, secure and document their source code by combining static analysis with AI reasoning.

> Status: 🚧 Under active development. This repository is being built in incremental, reviewable phases.

## What is AlgoLens?

AlgoLens brings together the strengths of tools like GitHub Copilot, SonarQube, CodeRabbit and IDE profilers into a single VS Code extension, so developers can:

- Understand what their code does and how it performs
- See time and space complexity with clear reasoning (best / average / worst case)
- Get estimated and measured runtime, plus memory analysis
- Catch bugs, code smells and security issues early
- Receive AI-explained optimization suggestions with trade-offs and confidence scores
- Visualize control flow, call graphs and dependency graphs
- Auto-generate documentation and exportable reports

## Project Status

This project is being developed according to a structured 40-phase roadmap defined in the project's governing documentation (`docs/`). Each phase is implemented, reviewed and completed independently before the next begins.

See [`PROGRESS.md`](PROGRESS.md) for the current phase and full roadmap status — that file is the single source of truth for project status, so it isn't duplicated here.

## Repository Structure

```text
AlgoLens/
├── apps/
│   ├── extension/     VS Code extension host (presentation-layer glue)
│   └── webview/       React webview UI
├── packages/
│   ├── ai/            AI provider layer (Claude, OpenAI, Gemini, DeepSeek, Qwen)
│   ├── analyzer/      Static analysis (complexity, algorithm/metric detection)
│   ├── benchmark/      Benchmark & measured-runtime engine
│   ├── core/          Core business logic, interfaces, Event Bus, DI
│   ├── documentation/ Documentation & report generation
│   ├── optimizer/     Optimization suggestions & patch generation
│   ├── parser/        AST parsing & language detection
│   ├── runtime/       Runtime estimation engine
│   ├── security/      Security scanning
│   ├── shared/        Cross-cutting utilities, types, constants
│   ├── storage/       SQLite-backed local storage
│   ├── ui/            Shared React component library
│   └── visualization/ Diagrams, graphs, charts
├── docs/       Project documentation and specifications
├── assets/     Images, icons and static design assets
├── scripts/    Developer and build automation scripts
├── tests/      Cross-package integration/e2e tests
├── .github/    CI workflows & repo templates (added in later phases)
├── LICENSE
├── PROGRESS.md
└── README.md
```

Each `packages/*` and `apps/*` folder contains its own `README.md` describing its responsibilities — see `MASTER_03_ARCHITECTURE.md` and `MASTER_01_PROJECT_BLUEPRINT.md` in the governing docs for the full architectural rationale.

## Getting Started

Setup instructions will be added once the build tooling is configured (see upcoming phases).

## License

Released under the [MIT License](LICENSE).
