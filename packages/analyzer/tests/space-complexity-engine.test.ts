import { describe, expect, it } from "vitest";
import { estimateSpaceComplexity } from "../src/index.js";
import type { StaticAnalysisResult } from "../src/types.js";

describe("SpaceComplexityEngine", () => {
  it("estimates constant space for a simple loop", () => {
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

    const result = estimateSpaceComplexity(
      "function search(items) { for (const item of items) { console.log(item); } }",
      analysis
    );

    expect(result.totalSpace).toBe("O(1)");
    expect(result.confidence).toBeGreaterThan(0);
  });
});
