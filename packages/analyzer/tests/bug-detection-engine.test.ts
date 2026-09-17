import { describe, expect, it } from "vitest";
import { analyzeBugs } from "../src/bug-detection/bug-detection-engine.js";
import type { StaticAnalysisResult } from "../src/types.js";

const analysis = (overrides: Partial<StaticAnalysisResult> = {}) =>
  ({
    loopCount: 0,
    maxLoopNestingDepth: 0,
    unusedVariables: [],
    deadCode: [],
    ...overrides,
  }) as StaticAnalysisResult;

describe("BugDetectionEngine", () => {
  it("returns a complete bug report from detected issues", () => {
    const report = analyzeBugs("const value = null;", analysis());

    expect(report.issueCount).toBe(1);
    expect(report.highCount).toBe(1);
    expect(report.mediumCount).toBe(0);
    expect(report.lowCount).toBe(0);
    expect(report.confidence).toBe(40);
    expect(report.issues[0]?.type).toBe("null-pointer");
  });

  it("returns a clean report when no bugs are detected", () => {
    const report = analyzeBugs("const total = 10 + 20;", analysis());

    expect(report.issueCount).toBe(0);
    expect(report.criticalCount).toBe(0);
    expect(report.highCount).toBe(0);
    expect(report.mediumCount).toBe(0);
    expect(report.lowCount).toBe(0);
    expect(report.confidence).toBe(100);
    expect(report.issues).toEqual([]);
  });
});
