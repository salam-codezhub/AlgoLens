import { describe, expect, it } from "vitest";
import { estimateTimeComplexity } from "../src/index.js";
import type { StaticAnalysisResult } from "../src/types.js";

describe("TimeComplexityEngine", () => {
  it("detects linear complexity for a simple loop", () => {
    const analysis: StaticAnalysisResult = {
      filePath: "test.ts",
      language: "typescript",
      analyzedAt: Date.now(),
      loopCount: 1,
      maxLoopNestingDepth: 1,
      recursiveFunctions: [],
      imports: [],
      unusedImports: [],
      unusedVariables: [],
      deadCode: [],
      functionComplexity: [],
      fileCyclomaticComplexity: 1,
      maintainabilityIndex: 100,
      ast: {} as StaticAnalysisResult["ast"],
    };

    const result = estimateTimeComplexity(
      "function search(items) { for (const item of items) { console.log(item); } }",
      analysis
    );

    expect(result.worstCase).toBe("O(n)");
    expect(result.confidence).toBeGreaterThan(0);
  });
});
