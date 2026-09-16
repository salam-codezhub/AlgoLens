import type { BenchmarkReport, BenchmarkSample } from "./types.js";

function calculateAverage(values: readonly number[]): number {
  if (values.length === 0) {
    throw new Error("Cannot calculate an average without values.");
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateMedian(values: readonly number[]): number {
  if (values.length === 0) {
    throw new Error("Cannot calculate a median without values.");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const middleValue = sorted[middle];

  if (middleValue === undefined) {
    throw new Error("Unable to determine the median value.");
  }

  if (sorted.length % 2 === 0) {
    const previousValue = sorted[middle - 1];

    if (previousValue === undefined) {
      throw new Error("Unable to determine the median values.");
    }

    return (previousValue + middleValue) / 2;
  }

  return middleValue;
}

export function createBenchmarkReport(samples: readonly BenchmarkSample[]): BenchmarkReport {
  if (samples.length === 0) {
    throw new Error("Cannot create a benchmark report without samples.");
  }

  const runtimes: number[] = samples.map((sample: BenchmarkSample) => sample.durationMs);

  const cpuUsage: number[] = samples.map(
    (sample: BenchmarkSample) => sample.cpuUserMs + sample.cpuSystemMs
  );

  return {
    minimumRuntimeMs: Math.min(...runtimes),
    maximumRuntimeMs: Math.max(...runtimes),
    averageRuntimeMs: calculateAverage(runtimes),
    medianRuntimeMs: calculateMedian(runtimes),
    executionCount: samples.length,
    cpuTrend: cpuUsage,
    samples,
  };
}
