import { describe, expect, it } from "vitest";
import { detectAlgorithms } from "../src/algorithms/algorithm-detector.js";
import type { StaticAnalysisResult } from "../src/types.js";

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

describe("AlgorithmDetector", () => {
  it("detects a recognizable binary search pattern", () => {
    const code = `
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}`;

    const matches = detectAlgorithms(code, analysis);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((match) => match.algorithm.includes("binary"))).toBe(true);
  });

  it("returns matches sorted by confidence", () => {
    const matches = detectAlgorithms(
      "function search(arr, target) { for (let i = 0; i < arr.length; i++) { if (arr[i] === target) return i; } return -1; }",
      analysis
    );

    for (let i = 1; i < matches.length; i += 1) {
      const previous = matches[i - 1];
      const current = matches[i];

      if (previous === undefined || current === undefined) {
        continue;
      }

      expect(previous.confidence).toBeGreaterThanOrEqual(current.confidence);
    }
  });
});
