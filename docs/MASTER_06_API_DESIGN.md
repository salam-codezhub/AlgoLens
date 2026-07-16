
# MASTER_06_API_DESIGN.md

Version: 1.0

Project: AlgoLens

## Purpose
Define all internal service contracts, interfaces and communication rules for AlgoLens.

---

# 1. API Design Principles

- Modules communicate through interfaces.
- Business logic is implementation-independent.
- Use dependency injection.
- Prefer async APIs.
- Standardize responses and errors.

---

# 2. Global Response Model

```ts
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  executionTime?: number;
  metadata?: Record<string, unknown>;
}
```

## Service Error

```ts
interface ServiceError {
  code: string;
  message: string;
  cause?: string;
  recoverable: boolean;
}
```

---

# 3. AI Provider Interface

```ts
interface AIProvider {
  initialize(): Promise<void>;
  analyzeCode(request: unknown): Promise<unknown>;
  optimizeCode(request: unknown): Promise<unknown>;
  generateDocumentation(request: unknown): Promise<unknown>;
  generateTests(request: unknown): Promise<unknown>;
  chat(request: unknown): Promise<unknown>;
  stream(request: unknown): AsyncIterable<unknown>;
  dispose(): Promise<void>;
}
```

Supported Providers:
- Claude
- OpenAI
- Gemini
- DeepSeek
- Qwen
- Local Models (Future)

---

# 4. Prompt Manager

Responsibilities:
- Load templates
- Render prompts
- Inject variables
- Validate prompts
- Cache prompts

```ts
interface PromptManager {
  loadPrompt(name: string): Promise<string>;
  renderPrompt(name: string, vars: object): Promise<string>;
  validatePrompt(prompt: string): boolean;
  clearCache(): void;
}
```

---

# 5. Context Builder

Collect:
- Workspace
- Current File
- Selected Code
- AST Summary
- Dependencies
- Language
- Recent Analysis

```ts
interface ContextBuilder {
  buildWorkspaceContext(): Promise<object>;
  buildFileContext(): Promise<object>;
  buildSelectionContext(): Promise<object>;
  buildAnalysisContext(): Promise<object>;
}
```

---

# 6. Parser API

```ts
interface Parser {
  parse(source: string): Promise<object>;
  getAST(): object;
  getFunctions(): object[];
  getClasses(): object[];
  getVariables(): object[];
  getImports(): object[];
}
```

---

# 7. Analyzer API

```ts
interface Analyzer {
  analyze(): Promise<object>;
  calculateMetrics(): Promise<object>;
  calculateComplexity(): Promise<object>;
  findIssues(): Promise<object>;
}
```

---

# 8. Algorithm Detector

```ts
interface AlgorithmDetector {
  detect(): Promise<object>;
  explain(): Promise<string>;
}
```

---

# 9. Complexity Engine

Returns:
- Best Case
- Average Case
- Worst Case
- Space Complexity
- Reasoning

```ts
interface ComplexityEngine {
  analyze(): Promise<object>;
}
```

---

# 10. Runtime Engine

```ts
interface RuntimeEngine {
  estimate(): Promise<object>;
  benchmark(): Promise<object>;
}
```

---

# 11. Memory Analyzer

```ts
interface MemoryAnalyzer {
  analyze(): Promise<object>;
}
```

---

# 12. Security Scanner

```ts
interface SecurityScanner {
  scan(): Promise<object>;
}
```

---

# 13. Bug Detector

```ts
interface BugDetector {
  detect(): Promise<object>;
}
```

---

# 14. Optimization Engine

```ts
interface OptimizationEngine {
  suggest(): Promise<object>;
  createPatch(): Promise<object>;
  applyPatch(): Promise<object>;
}
```

---

# 15. Export Service

```ts
interface ExportService {
  toMarkdown(): Promise<void>;
  toHTML(): Promise<void>;
  toPDF(): Promise<void>;
  toJSON(): Promise<void>;
}
```

---

# 16. Storage Service

```ts
interface StorageService {
  save(key: string, value: unknown): Promise<void>;
  load(key: string): Promise<unknown>;
  remove(key: string): Promise<void>;
}
```

---

# 17. Event Bus

Events:
- WorkspaceOpened
- FileChanged
- AnalysisStarted
- AnalysisCompleted
- OptimizationApplied
- ReportGenerated

---

# Definition of Done

- Interfaces documented
- Standard response model used
- Loose coupling maintained
- Async APIs
- Extendable for future modules

End of MASTER_06_API_DESIGN.md
