import { performance } from "node:perf_hooks";
import type { BenchmarkOptions, BenchmarkSample } from "./types.js";

const DEFAULT_ITERATIONS = 10;
const DEFAULT_WARMUP_ITERATIONS = 2;

export function runBenchmark(
  operation: () => void,
  options: BenchmarkOptions = {}
): readonly BenchmarkSample[] {
  const iterations = options.iterations ?? DEFAULT_ITERATIONS;
  const warmupIterations = options.warmupIterations ?? DEFAULT_WARMUP_ITERATIONS;

  if (iterations <= 0 || !Number.isInteger(iterations)) {
    throw new Error("Benchmark iterations must be a positive integer.");
  }

  if (warmupIterations < 0 || !Number.isInteger(warmupIterations)) {
    throw new Error("Warmup iterations must be a non-negative integer.");
  }

  for (let index = 0; index < warmupIterations; index += 1) {
    operation();
  }

  const samples: BenchmarkSample[] = [];

  for (let index = 0; index < iterations; index += 1) {
    const cpuStart = process.cpuUsage();
    const start = performance.now();

    operation();

    const durationMs = performance.now() - start;
    const cpuUsage = process.cpuUsage(cpuStart);

    samples.push({
      durationMs,
      cpuUserMs: cpuUsage.user / 1000,
      cpuSystemMs: cpuUsage.system / 1000,
    });
  }

  return samples;
}
