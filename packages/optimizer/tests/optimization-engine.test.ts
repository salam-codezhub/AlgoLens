import { describe, expect, it } from "vitest";
import { optimizeCode } from "../src/optimization-engine.js";
import { generateOptimizationSuggestions } from "../src/optimization-service.js";

describe("generateOptimizationSuggestions", () => {
  it("returns no suggestions for simple code", () => {
    expect(generateOptimizationSuggestions("const value = 1;")).toEqual([]);
  });

  it("detects loop work", () => {
    const suggestions = generateOptimizationSuggestions("for (let i = 0; i < 10; i++) {}");

    expect(suggestions.some((item) => item.title === "Review loop work")).toBe(true);
  });

  it("detects repeated array growth inside loops", () => {
    const suggestions = generateOptimizationSuggestions(
      "for (const item of items) { result.push(item); }"
    );

    expect(suggestions.some((item) => item.title === "Review repeated array growth")).toBe(true);
  });

  it("detects var declarations", () => {
    const suggestions = generateOptimizationSuggestions("var value = 1;");

    expect(suggestions.some((item) => item.type === "modernization")).toBe(true);
  });

  it("detects function responsibility and control-flow opportunities", () => {
    const suggestions = generateOptimizationSuggestions(
      "function process(value) { if (value) { return value; } }"
    );

    expect(suggestions.some((item) => item.type === "readability")).toBe(true);
    expect(suggestions.some((item) => item.type === "refactoring")).toBe(true);
  });
});

describe("optimizeCode", () => {
  it("preserves the original code when generating a report", () => {
    const code = "const value = 1;";
    const report = optimizeCode(code);

    expect(report.optimizedCode).toBe(code);
    expect(report.diff.before).toBe(code);
    expect(report.diff.after).toBe(code);
  });

  it("returns a no-op explanation for code without suggestions", () => {
    const report = optimizeCode("const value = 1;");

    expect(report.suggestions).toHaveLength(0);
    expect(report.confidence).toBe(100);
    expect(report.risk).toBe("low");
    expect(report.tradeOffs).toEqual([
      "No optimization opportunities were identified by the current heuristics.",
    ]);
    expect(report.explanation).toContain("original code is preserved");
  });

  it("aggregates confidence and reports optimization trade-offs", () => {
    const report = optimizeCode("var value = 1;");

    expect(report.suggestions.length).toBeGreaterThan(0);
    expect(report.confidence).toBe(
      Math.round(
        report.suggestions.reduce((sum, suggestion) => sum + suggestion.confidence, 0) /
          report.suggestions.length
      )
    );
    expect(report.risk).toBe("low");
    expect(report.tradeOffs).toHaveLength(3);
    expect(report.explanation).toContain("Optimization opportunities were identified");
  });
});
