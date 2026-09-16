/** Standard asymptotic complexity classes used for space analysis. */
export type SpaceComplexityClass = "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n^2)";

export interface SpaceComplexityEstimate {
  readonly auxiliarySpace: SpaceComplexityClass;
  readonly stackSpace: SpaceComplexityClass;
  readonly heapSpace: SpaceComplexityClass;
  readonly totalSpace: SpaceComplexityClass;
  readonly explanation: string;
  readonly confidence: number;
}
