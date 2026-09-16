export interface BenchmarkSample {
  readonly durationMs: number;
  readonly cpuUserMs: number;
  readonly cpuSystemMs: number;
}

export interface BenchmarkReport {
  readonly minimumRuntimeMs: number;
  readonly maximumRuntimeMs: number;
  readonly averageRuntimeMs: number;
  readonly medianRuntimeMs: number;
  readonly executionCount: number;
  readonly cpuTrend: readonly number[];
  readonly samples: readonly BenchmarkSample[];
}

export interface BenchmarkOptions {
  readonly iterations?: number;
  readonly warmupIterations?: number;
}
