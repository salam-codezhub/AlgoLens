import { runBenchmark } from "./benchmark-runner.js";
import { createBenchmarkReport } from "./benchmark-statistics.js";
import type { BenchmarkOptions, BenchmarkReport } from "./types.js";

export function benchmark(operation: () => void, options: BenchmarkOptions = {}): BenchmarkReport {
  const samples = runBenchmark(operation, options);

  return createBenchmarkReport(samples);
}
