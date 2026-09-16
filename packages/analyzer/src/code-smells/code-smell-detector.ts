import type { StaticAnalysisResult } from "../types.js";
import type { CodeSmellIssue } from "./types.js";

function createIssue(
  type: CodeSmellIssue["type"],
  severity: CodeSmellIssue["severity"],
  message: string,
  confidence: number
): CodeSmellIssue {
  return {
    type,
    severity,
    message,
    confidence,
  };
}

function countLines(code: string): number {
  return code.split(/\r?\n/).length;
}

function detectMagicNumbers(code: string): boolean {
  return /(^|[^\w.])(?:-?\d+(?:\.\d+)?)(?![\w.])/.test(code.replace(/\b(?:0|1)\b/g, ""));
}

function detectDuplicateCode(code: string): boolean {
  const statements = code
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 12);

  const seen = new Set<string>();

  for (const statement of statements) {
    if (seen.has(statement)) {
      return true;
    }

    seen.add(statement);
  }

  return false;
}

function detectPoorNaming(analysis: StaticAnalysisResult): boolean {
  const names = [...analysis.ast.functions, ...analysis.ast.classes, ...analysis.ast.variables];

  return names.some((name) => {
    if (name.length === 1) {
      return !["i", "j", "k", "x", "y", "z"].includes(name);
    }

    return /^(tmp|temp|foo|bar|baz|data|obj|val|var)\d*$/i.test(name);
  });
}

export function detectCodeSmells(
  code: string,
  analysis: StaticAnalysisResult
): readonly CodeSmellIssue[] {
  const issues: CodeSmellIssue[] = [];

  const totalLines = countLines(code);

  if (totalLines > 80 && analysis.ast.functions.length > 0) {
    issues.push(
      createIssue(
        "long-method",
        "medium",
        "File contains a long method candidate; consider splitting large responsibilities into smaller functions.",
        55
      )
    );
  }

  if (analysis.ast.classes.length > 3) {
    issues.push(
      createIssue(
        "large-class",
        "medium",
        "File contains several classes; review class responsibilities and size.",
        45
      )
    );
  }

  if (detectMagicNumbers(code)) {
    issues.push(
      createIssue(
        "magic-number",
        "low",
        "Numeric literal detected outside common zero/one cases; consider replacing it with a named constant.",
        65
      )
    );
  }

  if (analysis.maxLoopNestingDepth >= 3) {
    issues.push(
      createIssue(
        "deep-nesting",
        "high",
        `Deep nesting detected with maximum loop nesting depth of ${String(
          analysis.maxLoopNestingDepth
        )}.`,
        90
      )
    );
  }

  if (detectDuplicateCode(code)) {
    issues.push(
      createIssue(
        "duplicate-code",
        "medium",
        "Repeated source statements detected; consider extracting shared logic.",
        70
      )
    );
  }

  if (detectPoorNaming(analysis)) {
    issues.push(
      createIssue(
        "poor-naming",
        "low",
        "One or more identifiers use a potentially unclear or overly generic name.",
        60
      )
    );
  }

  return issues;
}
