import type { StaticAnalysisResult } from "../types.js";
import type { SpaceComplexityEstimate, SpaceComplexityClass } from "./types.js";

const RECURSION_STACK_SPACE: SpaceComplexityClass = "O(n)";

function hasLoopAllocation(code: string): boolean {
  const allocationPatterns = [
    /\bnew\s+(?:Array|Map|Set)\s*[<(]/,
    /\[[^\]]*\]\.push\s*\(/,
    /\bArray\s*\(/,
    /\bArrayList\s*</,
    /\[[^\]]*\]\s+for\s+\w+\s+in\b/,
  ];

  return allocationPatterns.some((pattern) => pattern.test(code));
}

function estimateHeapSpace(code: string): SpaceComplexityClass {
  return hasLoopAllocation(code) ? "O(n)" : "O(1)";
}

function estimateStackSpace(analysis: StaticAnalysisResult): SpaceComplexityClass {
  return analysis.recursiveFunctions.length > 0 ? RECURSION_STACK_SPACE : "O(1)";
}

function maxComplexity(
  first: SpaceComplexityClass,
  second: SpaceComplexityClass
): SpaceComplexityClass {
  const order: Record<SpaceComplexityClass, number> = {
    "O(1)": 0,
    "O(log n)": 1,
    "O(n)": 2,
    "O(n log n)": 3,
    "O(n^2)": 4,
  };

  return order[first] >= order[second] ? first : second;
}

export function estimateSpaceFromStructure(
  code: string,
  analysis: StaticAnalysisResult
): SpaceComplexityEstimate {
  const stackSpace = estimateStackSpace(analysis);
  const heapSpace = estimateHeapSpace(code);

  const auxiliarySpace = maxComplexity(stackSpace, heapSpace);
  const totalSpace = maxComplexity(stackSpace, heapSpace);

  const evidence: string[] = [];

  if (analysis.recursiveFunctions.length > 0) {
    evidence.push(
      `recursion detected in ${String(analysis.recursiveFunctions.length)} function(s), giving O(n) stack growth`
    );
  } else {
    evidence.push("no recursive functions detected, so stack usage is O(1)");
  }

  if (heapSpace === "O(n)") {
    evidence.push("dynamic allocation/storage patterns were detected");
  } else {
    evidence.push("no clear growing heap-allocation pattern was detected");
  }

  return {
    auxiliarySpace,
    stackSpace,
    heapSpace,
    totalSpace,
    explanation: `Structural space estimate: ${evidence.join("; ")}.`,
    confidence: analysis.recursiveFunctions.length > 0 || heapSpace === "O(n)" ? 65 : 55,
  };
}
