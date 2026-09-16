export type MemoryGrowthClass = "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n^2)";

export type LeakRisk = "low" | "medium" | "high";

export interface MemoryReport {
  readonly heapUsage: MemoryGrowthClass;
  readonly stackUsage: MemoryGrowthClass;
  readonly peakMemory: MemoryGrowthClass;
  readonly allocationGrowth: MemoryGrowthClass;
  readonly potentialLeaks: readonly string[];
  readonly leakRisk: LeakRisk;
  readonly explanation: string;
  readonly confidence: number;
}
