import type { StaticAnalysisResult } from "../types.js";
import type { RuntimeEstimate, RuntimeEstimateClass } from "./types.js";

function estimateFromStructure(analysis: StaticAnalysisResult): RuntimeEstimateClass {
  if (analysis.recursiveFunctions.length > 0) {
    return "O(2^n)";
  }

  if (analysis.maxLoopNestingDepth >= 3) {
    return "O(n^3)";
  }

  if (analysis.maxLoopNestingDepth === 2) {
    return "O(n^2)";
  }

  if (analysis.loopCount === 1) {
    return "O(n)";
  }

  return "O(1)";
}

export function estimateRuntimeFromStructure(analysis: StaticAnalysisResult): RuntimeEstimate {
  const estimatedTime = estimateFromStructure(analysis);

  const explanation =
    analysis.recursiveFunctions.length > 0
      ? `Structural runtime estimate based on ${String(
          analysis.recursiveFunctions.length
        )} recursive function(s).`
      : `Structural runtime estimate based on ${String(
          analysis.loopCount
        )} detected loop(s) and maximum nesting depth of ${String(analysis.maxLoopNestingDepth)}.`;

  return {
    estimatedTime,
    explanation,
    confidence: analysis.loopCount > 0 ? 55 : 50,
  };
}
