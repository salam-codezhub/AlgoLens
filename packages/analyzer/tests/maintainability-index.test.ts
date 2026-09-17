import { describe, expect, it } from "vitest";
import { computeMaintainabilityIndex } from "../src/complexity/maintainability-index.js";

describe("MaintainabilityIndex", () => {
  it("calculates a normalized maintainability score", () => {
    const result = computeMaintainabilityIndex(100, 5, 50);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it("handles zero metrics safely", () => {
    const result = computeMaintainabilityIndex(0, 0, 0);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
