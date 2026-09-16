export type CodeSmellType =
  | "long-method"
  | "large-class"
  | "magic-number"
  | "deep-nesting"
  | "duplicate-code"
  | "poor-naming";

export type CodeSmellSeverity = "low" | "medium" | "high";

export interface CodeSmellIssue {
  readonly type: CodeSmellType;
  readonly severity: CodeSmellSeverity;
  readonly message: string;
  readonly line?: number;
  readonly confidence: number;
}

export interface CodeSmellReport {
  readonly issues: readonly CodeSmellIssue[];
  readonly issueCount: number;
  readonly highCount: number;
  readonly mediumCount: number;
  readonly lowCount: number;
  readonly confidence: number;
}
