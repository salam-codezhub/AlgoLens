export type RuntimeEstimateClass =
  "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n^2)" | "O(n^3)" | "O(2^n)" | "O(n!)";

export interface RuntimeEstimate {
  readonly estimatedTime: RuntimeEstimateClass;
  readonly explanation: string;
  readonly confidence: number;
}
