export type DocumentationType =
  | "function"
  | "class"
  | "project"
  | "architecture"
  | "optimization"
  | "security"
  | "benchmark"
  | "complexity";

export type DocumentationFormat = "markdown" | "html" | "pdf";

export interface FunctionDocumentation {
  readonly name: string;
  readonly description: string;
  readonly parameters: readonly string[];
  readonly returns: string;
}

export interface ClassDocumentation {
  readonly name: string;
  readonly description: string;
  readonly methods: readonly string[];
}

export interface AnalysisDocumentation {
  readonly type: DocumentationType;
  readonly title: string;
  readonly content: string;
}

export interface ProjectDocumentation {
  readonly title: string;
  readonly overview: string;
  readonly functions: readonly FunctionDocumentation[];
  readonly classes: readonly ClassDocumentation[];
  readonly architectureSummary: string;
  readonly reports: readonly AnalysisDocumentation[];
}

export interface DocumentationExport {
  readonly format: DocumentationFormat;
  readonly content: string;
  readonly fileExtension: ".md" | ".html" | ".pdf";
}
