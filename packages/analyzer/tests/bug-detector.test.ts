import { describe, expect, it } from "vitest";
import { detectBugs } from "../src/bug-detection/bug-detector.js";
import type { StaticAnalysisResult } from "../src/types.js";

const analysis = (overrides: Partial<StaticAnalysisResult> = {}) =>
  ({
    loopCount: 0,
    maxLoopNestingDepth: 0,
    unusedVariables: [],
    deadCode: [],
    ...overrides,
  }) as StaticAnalysisResult;

describe("BugDetector", () => {
  it("detects null-pointer usage", () => {
    const issues = detectBugs("const value = null;", analysis());

    expect(issues.some((issue) => issue.type === "null-pointer")).toBe(true);
  });

  it("detects possible infinite-loop structure", () => {
    const issues = detectBugs(
      "while (true) { work(); }",
      analysis({
        loopCount: 1,
        maxLoopNestingDepth: 1,
      })
    );

    expect(issues.some((issue) => issue.type === "infinite-loop")).toBe(true);
  });

  it("detects unused variables and dead code", () => {
    const issues = detectBugs(
      "return value;",
      analysis({
        unusedVariables: [{ name: "unusedValue", confidence: 70 }],
        deadCode: [
          {
            afterStatementType: "return_statement",
            unreachableStatementCount: 1,
          },
        ],
      })
    );

    expect(issues.some((issue) => issue.type === "unused-variable")).toBe(true);
    expect(issues.some((issue) => issue.type === "dead-code")).toBe(true);
  });

  it("detects duplicate, overflow, and underflow indicators", () => {
    const issues = detectBugs(
      "const copy = clone(value); const max = INT_MAX; const min = INT_MIN;",
      analysis()
    );

    expect(issues.some((issue) => issue.type === "duplicate-logic")).toBe(true);
    expect(issues.some((issue) => issue.type === "overflow")).toBe(true);
    expect(issues.some((issue) => issue.type === "underflow")).toBe(true);
  });

  it("returns no issues for clean code", () => {
    const issues = detectBugs("const total = 10 + 20;", analysis());

    expect(issues).toEqual([]);
  });
});
