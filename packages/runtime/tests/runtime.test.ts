import { describe, expect, it } from "vitest";
import { measureRuntime, measureScaling, PACKAGE_NAME, getCpuTrend } from "../src/index.js";

describe("runtime package", () => {
  it("exports the canonical package name", () => {
    expect(PACKAGE_NAME).toBe("@algolens/runtime");
  });

  it("measures actual execution runtime", () => {
    const result = measureRuntime(
      () => {
        let total = 0;

        for (let index = 0; index < 1000; index += 1) {
          total += index;
        }

        return total;
      },
      { iterations: 3, warmupIterations: 1 }
    );

    expect(result.kind).toBe("measured");
    expect(result.report.executionCount).toBe(3);
    expect(result.report.averageRuntimeMs).toBeGreaterThanOrEqual(0);
    expect(result.report.samples).toHaveLength(3);
  });

  it("measures runtime across input sizes", () => {
    const result = measureScaling(
      [10, 100, 1_000],
      (inputSize) => {
        let total = 0;

        for (let index = 0; index < inputSize; index += 1) {
          total += index;
        }

        return total;
      },
      { iterations: 2, warmupIterations: 1 }
    );

    expect(result.kind).toBe("measured-scaling");
    expect(result.points).toHaveLength(3);
  });

  it("exposes measured CPU trend", () => {
    const result = measureRuntime(
      () => {
        let total = 0;

        for (let index = 0; index < 1000; index += 1) {
          total += index;
        }

        return total;
      },
      { iterations: 4, warmupIterations: 1 }
    );

    const trend = getCpuTrend(result);

    expect(trend).toHaveLength(4);
    expect(trend.every((value) => value >= 0)).toBe(true);
  });

  it("rejects empty runtime scaling input", () => {
    expect(() => measureScaling([], () => undefined)).toThrow(
      "Runtime scaling requires at least one input size."
    );
  });

  it("rejects invalid runtime scaling input", () => {
    expect(() => measureScaling([10, -1], () => undefined)).toThrow(
      "Runtime scaling input sizes must be finite non-negative numbers."
    );
  });
});
