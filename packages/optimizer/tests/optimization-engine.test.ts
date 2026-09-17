import { describe, expect, it } from "vitest";
import { optimizeCode } from "../src/optimization-engine.js";

describe("optimizeCode", () => {
  it("returns a clean report when no opportunities are found", () => {
    const report = optimizeCode("const value = 42;");

    expect(report.suggestions).toHaveLength(0);
    expect(report.confidence).toBe(100);
    expect(report.risk).toBe("low");
    expect(report.optimizedCode).toBe("const value = 42;");
    expect(report.explanation).toContain("No optimization changes were applied");
  });

  it("aggregates suggestions and calculates average confidence", () => {
    const report = optimizeCode(
      "var result = [];\nfor (let i = 0; i < 10; i++) { result.push(i); }"
    );

    expect(report.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(report.confidence).toBeGreaterThan(0);
    expect(report.confidence).toBeLessThan(100);
  });

  it("uses low risk for the current heuristic suggestions", () => {
    const report = optimizeCode("var value = 1;");

    expect(report.risk).toBe("low");
  });

  it("includes trade-offs when suggestions exist", () => {
    const report = optimizeCode("var value = 1;");

    expect(report.tradeOffs.length).toBeGreaterThan(0);
    expect(report.tradeOffs.some((item) => item.includes("Performance"))).toBe(true);
  });

  it("preserves the original code", () => {
    const code = "function process(value) { return value + 1; }";
    const report = optimizeCode(code);

    expect(report.optimizedCode).toBe(code);
    expect(report.diff.before).toBe(code);
    expect(report.diff.after).toBe(code);
  });

  it("produces an empty-change diff when no automatic modification is applied", () => {
    const code = "var value = 10;";
    const report = optimizeCode(code);

    expect(report.diff.before).toBe(code);
    expect(report.diff.after).toBe(code);
    expect(report.diff.unifiedDiff).toContain(` ${code}`);
  });

  it("explains that suggestions require explicit review", () => {
    const report = optimizeCode("if (ready) { doWork(); }");

    expect(report.explanation).toContain("explicit review");
  });
});
