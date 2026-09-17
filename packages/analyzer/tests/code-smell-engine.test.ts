import { describe, expect, it } from "vitest";
import { analyzeCodeSmells } from "../src/code-smells/code-smell-engine.js";
import type { StaticAnalysisResult } from "../src/types.js";

const analysis = (overrides: Partial<StaticAnalysisResult> = {}) =>
  ({
    loopCount: 0,
    maxLoopNestingDepth: 0,
    recursiveFunctions: [],
    imports: [],
    unusedImports: [],
    unusedVariables: [],
    deadCode: [],
    functionComplexity: [],
    fileCyclomaticComplexity: 1,
    maintainabilityIndex: 100,
    ast: {
      language: "javascript",
      imports: [],
      functions: [],
      variables: [],
      classes: [],
      loopCount: 0,
      recursiveFunctions: [],
      hasParseErrors: false,
      tokenCount: 0,
    },
    ...overrides,
  }) as StaticAnalysisResult;

describe("CodeSmellEngine", () => {
  it("returns a complete report from detected smells", () => {
    const report = analyzeCodeSmells("const timeout = 42;", analysis());

    expect(report.issueCount).toBe(1);
    expect(report.lowCount).toBe(1);
    expect(report.mediumCount).toBe(0);
    expect(report.highCount).toBe(0);
    expect(report.confidence).toBe(65);
    expect(report.issues[0]?.type).toBe("magic-number");
  });

  it("returns a clean report when no smells are detected", () => {
    const report = analyzeCodeSmells("const total = 0 + 1;", analysis());

    expect(report.issueCount).toBe(0);
    expect(report.highCount).toBe(0);
    expect(report.mediumCount).toBe(0);
    expect(report.lowCount).toBe(0);
    expect(report.confidence).toBe(100);
    expect(report.issues).toEqual([]);
  });
});
