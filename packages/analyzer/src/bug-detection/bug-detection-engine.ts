import type { StaticAnalysisResult } from "../types.js";
import { detectBugs } from "./bug-detector.js";
import { createBugReport } from "./bug-report.js";
import type { BugReport } from "./types.js";

export function analyzeBugs(code: string, analysis: StaticAnalysisResult): BugReport {
  const issues = detectBugs(code, analysis);

  return createBugReport(issues);
}
