import { describe, expect, it } from "vitest";
import { analyzeMemory } from "../src/memory-analysis/memory-analysis-engine.js";
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
      language: "python",
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

describe("MemoryAnalysisEngine", () => {
  it("returns a memory report from structural analysis", () => {
    const report = analyzeMemory(
      "items = [1, 2, 3]",
      analysis({
        ast: {
          language: "python",
          imports: [],
          functions: ["process"],
          variables: ["items"],
          classes: [],
          loopCount: 1,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 8,
        },
      })
    );

    expect(report).toBeDefined();
    expect(typeof report).toBe("object");
  });

  it("handles empty structural analysis", () => {
    const report = analyzeMemory("", analysis());

    expect(report).toBeDefined();
    expect(typeof report).toBe("object");
  });
});
