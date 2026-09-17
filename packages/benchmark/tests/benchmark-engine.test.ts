import { describe, expect, it } from "vitest";
import { benchmark } from "../src/index.js";

describe("BenchmarkEngine", () => {
  it("runs an operation and returns benchmark results", () => {
    const report = benchmark(
      () => {
        let total = 0;

        for (let i = 0; i < 1000; i += 1) {
          total += i;
        }

        void total;
      },
      {
        iterations: 3,
        warmupIterations: 1,
      }
    );

    expect(report.samples.length).toBe(3);
    expect(report.averageRuntimeMs).toBeGreaterThanOrEqual(0);
    expect(report.medianRuntimeMs).toBeGreaterThanOrEqual(0);
    expect(report.minimumRuntimeMs).toBeGreaterThanOrEqual(0);
    expect(report.maximumRuntimeMs).toBeGreaterThanOrEqual(0);
  });
});
