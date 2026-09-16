import type { AlgorithmMatch } from "../algorithms/types.js";
import type { StaticAnalysisResult } from "../types.js";
import { ALGORITHM_SPACE_TABLE } from "./algorithm-space-table.js";
import { estimateSpaceFromStructure } from "./structural-estimator.js";
import type { SpaceComplexityEstimate } from "./types.js";

const MIN_ALGORITHM_CONFIDENCE_TO_TRUST = 70;

export function estimateSpaceComplexity(
  code: string,
  analysis: StaticAnalysisResult,
  algorithmMatches: readonly AlgorithmMatch[] = []
): SpaceComplexityEstimate {
  const confidentMatch = algorithmMatches
    .filter((match) => match.confidence >= MIN_ALGORITHM_CONFIDENCE_TO_TRUST)
    .sort((a, b) => b.confidence - a.confidence)[0];

  if (confidentMatch) {
    const profile = ALGORITHM_SPACE_TABLE[confidentMatch.algorithm];

    return {
      auxiliarySpace: profile.auxiliarySpace,
      stackSpace: profile.stackSpace,
      heapSpace: profile.heapSpace,
      totalSpace: profile.auxiliarySpace,
      explanation:
        `${profile.reasoning} ` +
        `The ${confidentMatch.algorithm} algorithm was detected ` +
        `with ${String(confidentMatch.confidence)}% confidence`,
      confidence: confidentMatch.confidence,
    };
  }

  return estimateSpaceFromStructure(code, analysis);
}
