import type { AlgorithmDetectionContext, AlgorithmMatch, AlgorithmType } from "./types.js";

export interface Signal {
  readonly description: string;
  readonly weight: number;
  readonly test: (ctx: AlgorithmDetectionContext) => boolean;
}

export interface AlgorithmDetector {
  readonly algorithm: AlgorithmType;
  readonly signals: readonly Signal[];
  /** Minimum number of distinct signals that must match before reporting
   *  anything at all — a single coincidental keyword match (e.g. the word
   *  "queue" appearing in an unrelated comment) shouldn't produce a
   *  result on its own. */
  readonly minSignalsRequired: number;
  /** If any of these fire, this detector never matches, regardless of its
   *  own signals — for genuinely overlapping structural patterns (a merge
   *  sort's midpoint calculation is structurally almost identical to
   *  binary search's) where the real distinguishing evidence is a more
   *  specific *other* algorithm's marker being present, not anything this
   *  detector could positively check for on its own. Discovered via
   *  testing a real merge sort implementation that binary-search's
   *  signals matched at equal-or-higher confidence than merge-sort's own. */
  readonly disqualifiers?: readonly Signal[];
}

/**
 * Runs one detector's signals against `ctx` and returns a match if enough
 * signals fired, or `null` otherwise.
 *
 * Confidence is the proportion of this detector's total signal weight
 * that actually matched, scaled into the project's standard 0-100
 * Confidence Score range — but capped at 85, never higher: this is
 * pattern-based detection over an AST/text, not a formal proof the code
 * implements the named algorithm (that would require actual semantic/
 * behavioral verification, e.g. running it against known test cases,
 * which is a different and much larger problem than static signal
 * matching). Per MASTER_05_AI_RULES.md's Confidence Score scale, capping
 * below 90 is itself an honest signal: never claim "verified" for
 * something this method fundamentally cannot verify.
 */
export function runDetector(
  detector: AlgorithmDetector,
  ctx: AlgorithmDetectionContext
): AlgorithmMatch | null {
  if (detector.disqualifiers?.some((signal) => signal.test(ctx))) {
    return null;
  }

  const matched = detector.signals.filter((signal) => signal.test(ctx));

  if (matched.length < detector.minSignalsRequired) {
    return null;
  }

  const totalWeight = detector.signals.reduce((sum, signal) => sum + signal.weight, 0);
  const matchedWeight = matched.reduce((sum, signal) => sum + signal.weight, 0);
  const confidence = Math.min(85, Math.round((matchedWeight / totalWeight) * 100));

  return {
    algorithm: detector.algorithm,
    confidence,
    matchedSignals: matched.map((signal) => signal.description),
  };
}
