import { ALGORITHM_DETECTORS } from "./algorithm-detectors.js";
import { runDetector } from "./detector-engine.js";
import type { AlgorithmDetectionContext, AlgorithmMatch } from "./types.js";
import type { StaticAnalysisResult } from "../types.js";

/**
 * Runs every algorithm detector (Phase 22's fourteen) against `code` and
 * returns every match found, sorted by confidence descending — highest
 * confidence first. Callers should treat this as a shortlist of
 * candidates, not a single definitive answer: a file can genuinely
 * contain multiple recognizable patterns (e.g. a quicksort that also
 * happens to use a hashmap for something else), and this correctly
 * reports each independently rather than forcing one "the" answer.
 */
export function detectAlgorithms(
  code: string,
  analysis: StaticAnalysisResult
): readonly AlgorithmMatch[] {
  const ctx: AlgorithmDetectionContext = {
    code,
    normalizedCode: code.toLowerCase(),
    analysis,
  };

  const matches = ALGORITHM_DETECTORS.map((detector) => runDetector(detector, ctx)).filter(
    (match): match is AlgorithmMatch => match !== null
  );

  return [...matches].sort((a, b) => b.confidence - a.confidence);
}
