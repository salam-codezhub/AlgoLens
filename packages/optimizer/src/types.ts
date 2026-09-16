export type OptimizationType =
  | "performance"
  | "memory"
  | "readability"
  | "modernization"
  | "refactoring"
  | "complexity-reduction";

export type OptimizationRisk = "low" | "medium" | "high";

export interface OptimizationSuggestion {
  readonly type: OptimizationType;
  readonly title: string;
  readonly description: string;
  readonly rationale: string;
  readonly risk: OptimizationRisk;
  readonly confidence: number;
}

export interface OptimizationDiff {
  readonly before: string;
  readonly after: string;
  readonly unifiedDiff: string;
}

export interface OptimizationReport {
  readonly optimizedCode: string;
  readonly suggestions: readonly OptimizationSuggestion[];
  readonly diff: OptimizationDiff;
  readonly confidence: number;
  readonly risk: OptimizationRisk;
  readonly tradeOffs: readonly string[];
  readonly explanation: string;
}
