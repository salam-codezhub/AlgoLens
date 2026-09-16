import type { StaticAnalysisResult } from "../types.js";
import { detectCodeSmells } from "./code-smell-detector.js";
import { createCodeSmellReport } from "./code-smell-report.js";
import type { CodeSmellReport } from "./types.js";

export function analyzeCodeSmells(code: string, analysis: StaticAnalysisResult): CodeSmellReport {
  const issues = detectCodeSmells(code, analysis);

  return createCodeSmellReport(issues);
}
