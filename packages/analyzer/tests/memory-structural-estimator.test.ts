import { describe, expect, it } from "vitest";
import { analyzeMemoryFromStructure } from "../src/memory-analysis/structural-estimator.js";
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

describe("Memory structural estimator", () => {
  it("estimates constant heap and stack usage for simple code", () => {
    const report = analyzeMemoryFromStructure(analysis());

    expect(report.heapUsage).toBe("O(1)");
    expect(report.stackUsage).toBe("O(1)");
    expect(report.peakMemory).toBe("O(1)");
    expect(report.allocationGrowth).toBe("O(1)");
    expect(report.leakRisk).toBe("low");
    expect(report.potentialLeaks).toEqual([]);
    expect(report.confidence).toBe(50);
  });

  it("estimates linear heap usage for classes or many variables", () => {
    const classReport = analyzeMemoryFromStructure(
      analysis({
        ast: {
          language: "python",
          imports: [],
          functions: [],
          variables: [],
          classes: ["Search"],
          loopCount: 0,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 0,
        },
      })
    );

    expect(classReport.heapUsage).toBe("O(n)");

    const variableReport = analyzeMemoryFromStructure(
      analysis({
        ast: {
          language: "python",
          imports: [],
          functions: [],
          variables: Array.from({ length: 11 }, (_, index) => `value${String(index)}`),
          classes: [],
          loopCount: 0,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 0,
        },
      })
    );

    expect(variableReport.heapUsage).toBe("O(n)");
  });

  it("estimates logarithmic stack usage for recursive functions", () => {
    const report = analyzeMemoryFromStructure(
      analysis({
        recursiveFunctions: ["factorial"],
      })
    );

    expect(report.stackUsage).toBe("O(log n)");
    expect(report.peakMemory).toBe("O(log n)");
  });

  it("uses the larger growth class for peak memory", () => {
    const report = analyzeMemoryFromStructure(
      analysis({
        recursiveFunctions: ["process"],
        ast: {
          language: "python",
          imports: [],
          functions: [],
          variables: Array.from({ length: 11 }, (_, index) => `value${String(index)}`),
          classes: [],
          loopCount: 0,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 0,
        },
      })
    );

    expect(report.heapUsage).toBe("O(n)");
    expect(report.stackUsage).toBe("O(log n)");
    expect(report.peakMemory).toBe("O(n)");
  });

  it("estimates linear allocation growth when loops exist", () => {
    const report = analyzeMemoryFromStructure(
      analysis({
        loopCount: 2,
      })
    );

    expect(report.allocationGrowth).toBe("O(n)");
  });

  it("reports unused variables as potential memory leaks", () => {
    const report = analyzeMemoryFromStructure(
      analysis({
        unusedVariables: [
          { name: "first", confidence: 70 },
          { name: "second", confidence: 70 },
          { name: "third", confidence: 70 },
        ],
      })
    );

    expect(report.potentialLeaks).toHaveLength(3);
    expect(report.potentialLeaks[0]).toContain('Unused variable "first"');
    expect(report.leakRisk).toBe("high");
  });

  it("uses medium leak risk for one or two unused variables", () => {
    const report = analyzeMemoryFromStructure(
      analysis({
        unusedVariables: [{ name: "unusedValue", confidence: 70 }],
      })
    );

    expect(report.potentialLeaks).toHaveLength(1);
    expect(report.leakRisk).toBe("medium");
  });

  it("includes structural metrics in the explanation", () => {
    const report = analyzeMemoryFromStructure(
      analysis({
        loopCount: 2,
        recursiveFunctions: ["process"],
        ast: {
          language: "python",
          imports: [],
          functions: ["process"],
          variables: ["items", "count"],
          classes: ["Worker"],
          loopCount: 2,
          recursiveFunctions: ["process"],
          hasParseErrors: false,
          tokenCount: 10,
        },
      })
    );

    expect(report.explanation).toContain("2 detected variable(s)");
    expect(report.explanation).toContain("1 class(es)");
    expect(report.explanation).toContain("2 loop(s)");
    expect(report.explanation).toContain("1 recursive function(s)");
  });
});
