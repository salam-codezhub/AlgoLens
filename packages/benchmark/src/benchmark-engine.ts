import { runAsyncBenchmark, runBenchmark } from "./benchmark-runner.js";
import { createBenchmarkReport } from "./benchmark-statistics.js";
import type { BenchmarkOptions, BenchmarkReport } from "./types.js";

export function benchmark(operation: () => void, options: BenchmarkOptions = {}): BenchmarkReport {
  const samples = runBenchmark(operation, options);

  return createBenchmarkReport(samples);
}

export async function benchmarkAsync(
  operation: () => Promise<unknown>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkReport> {
  const samples = await runAsyncBenchmark(operation, options);

  return createBenchmarkReport(samples);
}
