import type { AlgorithmMatch } from "../algorithms/types.js";
import type { StaticAnalysisResult } from "../types.js";
import { ALGORITHM_COMPLEXITY_TABLE } from "./algorithm-complexity-table.js";
import { estimateFromStructure } from "./structural-estimator.js";
import type { TimeComplexityEstimate } from "./types.js";

/** Below this confidence, a Phase 22 algorithm match isn't trusted enough
 *  to drive the complexity estimate — falls through to the structural
 *  estimator instead. Matches the "50-69 needs review" band from the
 *  project's Confidence Score scale (MASTER_05_AI_RULES.md): a match
 *  below that band is a weak hypothesis, not solid enough evidence to
 *  assert a specific algorithm's textbook complexity. */
const MIN_ALGORITHM_CONFIDENCE_TO_TRUST = 70;

/**
 * Estimates Best/Average/Worst case time complexity with an explanation
 * (Phase 23's objective and literal acceptance criterion).
 *
 * Prefers a confidently detected algorithm's known, textbook complexity
 * (Phase 22 + algorithm-complexity-table.ts) over the generic structural
 * estimator (structural-estimator.ts) — a real "binary-search" match is
 * far more reliable evidence than counting loop nesting depth alone.
 * Falls back to the structural estimator when no algorithm was detected
 * confidently enough, or when no algorithm was detected at all.
 */
export function estimateTimeComplexity(
  code: string,
  analysis: StaticAnalysisResult,
  algorithmMatches: readonly AlgorithmMatch[] = []
): TimeComplexityEstimate {
  const bestMatch = algorithmMatches[0];

  if (bestMatch && bestMatch.confidence >= MIN_ALGORITHM_CONFIDENCE_TO_TRUST) {
    const known = ALGORITHM_COMPLEXITY_TABLE[bestMatch.algorithm];
    return {
      bestCase: known.bestCase,
      averageCase: known.averageCase,
      worstCase: known.worstCase,
      explanation: `Detected as ${bestMatch.algorithm} (${String(bestMatch.confidence)}% confidence, based on: ${bestMatch.matchedSignals.join("; ")}). ${known.reasoning}`,
      confidence: bestMatch.confidence,
    };
  }

  return estimateFromStructure(code, analysis);
}
