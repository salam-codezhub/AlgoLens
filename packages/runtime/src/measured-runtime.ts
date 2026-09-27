import {
  benchmark,
  benchmarkAsync,
  type BenchmarkOptions,
  type BenchmarkReport,
} from "@algolens/benchmark";

export interface MeasuredRuntime {
  readonly kind: "measured";
  readonly report: BenchmarkReport;
}

export interface RuntimeScalingPoint {
  readonly inputSize: number;
  readonly averageRuntimeMs: number;
  readonly minimumRuntimeMs: number;
  readonly maximumRuntimeMs: number;
}

export interface RuntimeScalingReport {
  readonly kind: "measured-scaling";
  readonly points: readonly RuntimeScalingPoint[];
}

export function measureRuntime(
  operation: () => unknown,
  options: BenchmarkOptions = {}
): MeasuredRuntime {
  const report = benchmark(() => {
    operation();
  }, options);

  return {
    kind: "measured",
    report,
  };
}

export async function measureRuntimeAsync(
  operation: () => Promise<unknown>,
  options: BenchmarkOptions = {}
): Promise<MeasuredRuntime> {
  const report = await benchmarkAsync(operation, options);

  return {
    kind: "measured",
    report,
  };
}

export function measureScaling(
  inputSizes: readonly number[],
  operation: (inputSize: number) => unknown,
  options: BenchmarkOptions = {}
): RuntimeScalingReport {
  if (inputSizes.length === 0) {
    throw new Error("Runtime scaling requires at least one input size.");
  }

  const points = inputSizes.map((inputSize) => {
    if (!Number.isFinite(inputSize) || inputSize < 0) {
      throw new Error("Runtime scaling input sizes must be finite non-negative numbers.");
    }

    const report = benchmark(() => {
      operation(inputSize);
    }, options);

    return {
      inputSize,
      averageRuntimeMs: report.averageRuntimeMs,
      minimumRuntimeMs: report.minimumRuntimeMs,
      maximumRuntimeMs: report.maximumRuntimeMs,
    };
  });

  return {
    kind: "measured-scaling",
    points,
  };
}

export function getCpuTrend(result: MeasuredRuntime): readonly number[] {
  return result.report.cpuTrend;
}
