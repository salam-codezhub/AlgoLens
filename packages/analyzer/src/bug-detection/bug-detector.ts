import type { StaticAnalysisResult } from "../types.js";
import type { BugIssue } from "./types.js";

function createIssue(
  type: BugIssue["type"],
  severity: BugIssue["severity"],
  message: string,
  confidence: number
): BugIssue {
  return {
    type,
    severity,
    message,
    confidence,
  };
}

export function detectBugs(code: string, analysis: StaticAnalysisResult): readonly BugIssue[] {
  const issues: BugIssue[] = [];

  if (analysis.loopCount > 0 && analysis.maxLoopNestingDepth > 0) {
    issues.push(
      createIssue(
        "infinite-loop",
        "medium",
        "Loop structure may contain a non-terminating path; verify its exit condition.",
        45
      )
    );
  }

  if (/\b(null|nullptr|None)\b/.test(code)) {
    issues.push(
      createIssue(
        "null-pointer",
        "high",
        "Nullable value detected; verify that it is checked before dereference.",
        40
      )
    );
  }

  for (const symbol of analysis.unusedVariables) {
    issues.push(
      createIssue(
        "unused-variable",
        "low",
        `Variable "${symbol.name}" is reported as unused.`,
        symbol.confidence
      )
    );
  }

  for (const deadCode of analysis.deadCode) {
    issues.push(
      createIssue(
        "dead-code",
        "medium",
        `${String(deadCode.unreachableStatementCount)} statement(s) follow an unconditional ${deadCode.afterStatementType}.`,
        90
      )
    );
  }

  if (/\b(duplicate|copy|clone)\b/i.test(code)) {
    issues.push(
      createIssue(
        "duplicate-logic",
        "low",
        "Code contains a possible duplicate-logic indicator; structural similarity analysis is required for confirmation.",
        25
      )
    );
  }

  if (/\b(MAX|INT_MAX|UINT_MAX|Number\.MAX_SAFE_INTEGER)\b/.test(code)) {
    issues.push(
      createIssue(
        "overflow",
        "medium",
        "A maximum numeric boundary is referenced; verify arithmetic cannot exceed the supported range.",
        45
      )
    );
  }

  if (/\b(MIN|INT_MIN|Number\.MIN_SAFE_INTEGER)\b/.test(code)) {
    issues.push(
      createIssue(
        "underflow",
        "medium",
        "A minimum numeric boundary is referenced; verify arithmetic cannot fall below the supported range.",
        45
      )
    );
  }

  return issues;
}
