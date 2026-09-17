import { describe, expect, it } from "vitest";
import { computeHalsteadMetrics } from "../src/complexity/halstead.js";

describe("HalsteadMetrics", () => {
  it("calculates operator, operand, and volume metrics", () => {
    const result = computeHalsteadMetrics(["a", "=", "b", "+", "1", "+", "b"]);

    expect(result.distinctOperators).toBe(2);
    expect(result.distinctOperands).toBe(3);
    expect(result.totalOperators).toBe(3);
    expect(result.totalOperands).toBe(4);
    expect(result.volume).toBeGreaterThan(0);
  });

  it("returns zero volume for empty tokens", () => {
    const result = computeHalsteadMetrics([]);

    expect(result.distinctOperators).toBe(0);
    expect(result.distinctOperands).toBe(0);
    expect(result.totalOperators).toBe(0);
    expect(result.totalOperands).toBe(0);
    expect(result.volume).toBe(0);
  });
});
