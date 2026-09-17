import { describe, expect, it } from "vitest";
import { generateOptimizationSuggestions } from "../src/optimization-service.js";

describe("generateOptimizationSuggestions", () => {
  it("suggests reviewing loop work", () => {
    const suggestions = generateOptimizationSuggestions("for (let i = 0; i < 10; i++) {}");

    expect(suggestions.some((item) => item.type === "performance")).toBe(true);
    expect(suggestions.some((item) => item.title === "Review loop work")).toBe(true);
  });

  it("suggests reviewing repeated array growth", () => {
    const suggestions = generateOptimizationSuggestions(
      "for (const item of items) { result.push(item); }"
    );

    expect(suggestions.some((item) => item.title === "Review repeated array growth")).toBe(true);
  });

  it("suggests modern variable declarations for var", () => {
    const suggestions = generateOptimizationSuggestions("var count = 0;");

    const suggestion = suggestions.find((item) => item.type === "modernization");

    expect(suggestion?.confidence).toBe(90);
    expect(suggestion?.risk).toBe("low");
  });

  it("suggests reviewing function responsibilities", () => {
    const suggestions = generateOptimizationSuggestions(
      "function process(value) { return value + 1; }"
    );

    expect(suggestions.some((item) => item.title === "Review function responsibilities")).toBe(
      true
    );
  });

  it("suggests reviewing control-flow complexity", () => {
    const suggestions = generateOptimizationSuggestions("if (ready) { doWork(); }");

    expect(suggestions.some((item) => item.title === "Review control-flow complexity")).toBe(true);
  });

  it("returns no suggestions for simple code", () => {
    const suggestions = generateOptimizationSuggestions("const value = 42;");

    expect(suggestions).toHaveLength(0);
  });

  it("can produce multiple suggestions for matching code", () => {
    const suggestions = generateOptimizationSuggestions(
      "var result = [];\nfor (let i = 0; i < 10; i++) { result.push(i); }"
    );

    expect(suggestions.length).toBeGreaterThanOrEqual(3);
  });
});
