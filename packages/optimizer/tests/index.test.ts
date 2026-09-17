import { describe, expect, it } from "vitest";
import {
  PACKAGE_NAME,
  createOptimizationDiff,
  generateOptimizationSuggestions,
  optimizeCode,
  previewModification,
} from "../src/index.js";

describe("optimizer public API", () => {
  it("exports the canonical package name", () => {
    expect(PACKAGE_NAME).toBe("@algolens/optimizer");
  });

  it("re-exports optimization functionality", () => {
    expect(typeof createOptimizationDiff).toBe("function");
    expect(typeof generateOptimizationSuggestions).toBe("function");
    expect(typeof optimizeCode).toBe("function");
  });

  it("re-exports modification functionality", () => {
    expect(typeof previewModification).toBe("function");
  });
});
