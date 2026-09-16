export type SecurityIssueType =
  | "sql-injection"
  | "xss"
  | "unsafe-input"
  | "secret"
  | "weak-crypto"
  | "unsafe-file-access"
  | "command-injection";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityIssue {
  readonly type: SecurityIssueType;
  readonly severity: SecuritySeverity;
  readonly message: string;
  readonly line?: number;
  readonly confidence: number;
}

export interface SecurityReport {
  readonly issues: readonly SecurityIssue[];
  readonly issueCount: number;
  readonly criticalCount: number;
  readonly highCount: number;
  readonly mediumCount: number;
  readonly lowCount: number;
  readonly confidence: number;
}
