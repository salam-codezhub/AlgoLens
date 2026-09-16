import type { SecurityIssue, SecurityReport } from "./types.js";

export function createSecurityReport(issues: readonly SecurityIssue[]): SecurityReport {
  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;

  const highCount = issues.filter((issue) => issue.severity === "high").length;

  const mediumCount = issues.filter((issue) => issue.severity === "medium").length;

  const lowCount = issues.filter((issue) => issue.severity === "low").length;

  const confidence =
    issues.length === 0
      ? 100
      : Math.round(issues.reduce((sum, issue) => sum + issue.confidence, 0) / issues.length);

  return {
    issues,
    issueCount: issues.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    confidence,
  };
}
