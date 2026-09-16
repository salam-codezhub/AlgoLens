import type { AlgorithmMatch } from "../algorithms/types.js";
import type { StaticAnalysisResult } from "../types.js";
import { ALGORITHM_RUNTIME_TABLE } from "./algorithm-runtime-table.js";
import { estimateRuntimeFromStructure } from "./structural-estimator.js";
import type { RuntimeEstimate } from "./types.js";

const MIN_ALGORITHM_CONFIDENCE_TO_TRUST = 70;

export function estimateRuntime(
  _code: string,
  analysis: StaticAnalysisResult,
  algorithmMatches: readonly AlgorithmMatch[] = []
): RuntimeEstimate {
  const bestMatch = algorithmMatches[0];

  if (bestMatch && bestMatch.confidence >= MIN_ALGORITHM_CONFIDENCE_TO_TRUST) {
    const known = ALGORITHM_RUNTIME_TABLE[bestMatch.algorithm];

    return {
      estimatedTime: known.estimatedTime,
      explanation:
        `Detected as ${bestMatch.algorithm} ` +
        `(${String(bestMatch.confidence)}% confidence, based on: ` +
        `${bestMatch.matchedSignals.join("; ")}). ${known.reasoning}`,
      confidence: bestMatch.confidence,
    };
  }

  return estimateRuntimeFromStructure(analysis);
}
