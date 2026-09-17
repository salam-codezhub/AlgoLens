import { describe, expect, it } from "vitest";
import { createOptimizationDiff } from "../src/diff-generator.js";

describe("createOptimizationDiff", () => {
  it("returns the original before and after code", () => {
    const diff = createOptimizationDiff("const x = 1;", "const x = 2;");

    expect(diff.before).toBe("const x = 1;");
    expect(diff.after).toBe("const x = 2;");
  });

  it("shows changed lines in unified diff format", () => {
    const diff = createOptimizationDiff(
      "const x = 1;\nconsole.log(x);",
      "const x = 2;\nconsole.log(x);"
    );

    expect(diff.unifiedDiff).toContain("-const x = 1;");
    expect(diff.unifiedDiff).toContain("+const x = 2;");
    expect(diff.unifiedDiff).toContain(" console.log(x);");
  });

  it("handles added lines", () => {
    const diff = createOptimizationDiff("line1", "line1\nline2");

    expect(diff.unifiedDiff).toContain(" line1");
    expect(diff.unifiedDiff).toContain("+line2");
  });

  it("handles removed lines", () => {
    const diff = createOptimizationDiff("line1\nline2", "line1");

    expect(diff.unifiedDiff).toContain(" line1");
    expect(diff.unifiedDiff).toContain("-line2");
  });

  it("handles identical code", () => {
    const diff = createOptimizationDiff("same\ncode", "same\ncode");

    expect(diff.unifiedDiff).toBe(" same\n code");
  });

  it("handles empty code", () => {
    const diff = createOptimizationDiff("", "");

    expect(diff.before).toBe("");
    expect(diff.after).toBe("");
    expect(diff.unifiedDiff).toBe(" ");
  });
});
