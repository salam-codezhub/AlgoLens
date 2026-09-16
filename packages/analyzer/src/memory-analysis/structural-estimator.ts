import type { StaticAnalysisResult } from "../types.js";
import type { MemoryGrowthClass, MemoryReport } from "./types.js";

function estimateHeapUsage(analysis: StaticAnalysisResult): MemoryGrowthClass {
  if (analysis.ast.classes.length > 0 || analysis.ast.variables.length > 10) {
    return "O(n)";
  }

  return "O(1)";
}

function estimateStackUsage(analysis: StaticAnalysisResult): MemoryGrowthClass {
  if (analysis.recursiveFunctions.length > 0) {
    return "O(log n)";
  }

  return "O(1)";
}

function estimatePeakMemory(
  heapUsage: MemoryGrowthClass,
  stackUsage: MemoryGrowthClass
): MemoryGrowthClass {
  const rank: Record<MemoryGrowthClass, number> = {
    "O(1)": 0,
    "O(log n)": 1,
    "O(n)": 2,
    "O(n log n)": 3,
    "O(n^2)": 4,
  };

  return rank[heapUsage] >= rank[stackUsage] ? heapUsage : stackUsage;
}

export function analyzeMemoryFromStructure(analysis: StaticAnalysisResult): MemoryReport {
  const heapUsage = estimateHeapUsage(analysis);
  const stackUsage = estimateStackUsage(analysis);
  const peakMemory = estimatePeakMemory(heapUsage, stackUsage);

  const allocationGrowth: MemoryGrowthClass = analysis.loopCount > 0 ? "O(n)" : "O(1)";

  const potentialLeaks =
    analysis.unusedVariables.length > 0
      ? analysis.unusedVariables.map(
          (symbol) => `Unused variable "${symbol.name}" may retain unnecessary memory.`
        )
      : [];

  const leakRisk =
    potentialLeaks.length >= 3 ? "high" : potentialLeaks.length > 0 ? "medium" : "low";

  const explanation = `Structural memory estimate based on ${String(
    analysis.ast.variables.length
  )} detected variable(s), ${String(analysis.ast.classes.length)} class(es), ${String(
    analysis.loopCount
  )} loop(s), and ${String(analysis.recursiveFunctions.length)} recursive function(s).`;

  return {
    heapUsage,
    stackUsage,
    peakMemory,
    allocationGrowth,
    potentialLeaks,
    leakRisk,
    explanation,
    confidence: 50,
  };
}
