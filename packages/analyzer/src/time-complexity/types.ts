/** Standard asymptotic complexity classes, ordered from fastest to
 *  slowest growth — the well-established Big-O hierarchy, not invented
 *  categories. */
export type ComplexityClass =
  "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n^2)" | "O(n^3)" | "O(2^n)" | "O(n!)";

export interface TimeComplexityEstimate {
  readonly bestCase: ComplexityClass;
  readonly averageCase: ComplexityClass;
  readonly worstCase: ComplexityClass;
  /** Human-readable reasoning citing the actual structural evidence found
   *  (loop nesting depth, recursion pattern, or a detected algorithm) —
   *  the literal Phase 23 acceptance criterion is "generated with
   *  explanation", not just a bare Big-O string. */
  readonly explanation: string;
  /** 0-100, same Confidence Score scale used throughout the project
   *  (MASTER_05_AI_RULES.md). Estimates derived from a confidently
   *  detected algorithm (Phase 22) inherit that algorithm's own
   *  well-established complexity and score higher; the generic
   *  structural fallback is inherently less certain and scores lower. */
  readonly confidence: number;
}
