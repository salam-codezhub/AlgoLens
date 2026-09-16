export type BugType =
  | "infinite-loop"
  | "null-pointer"
  | "unused-variable"
  | "dead-code"
  | "duplicate-logic"
  | "overflow"
  | "underflow";

export type BugSeverity = "low" | "medium" | "high" | "critical";

export interface BugIssue {
  readonly type: BugType;
  readonly severity: BugSeverity;
  readonly message: string;
  readonly line?: number;
  readonly confidence: number;
}

export interface BugReport {
  readonly issues: readonly BugIssue[];
  readonly issueCount: number;
  readonly criticalCount: number;
  readonly highCount: number;
  readonly mediumCount: number;
  readonly lowCount: number;
  readonly confidence: number;
}
