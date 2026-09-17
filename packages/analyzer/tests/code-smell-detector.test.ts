import { describe, expect, it } from "vitest";
import { detectCodeSmells } from "../src/code-smells/code-smell-detector.js";
import type { StaticAnalysisResult } from "../src/types.js";

const analysis = (overrides: Partial<StaticAnalysisResult> = {}) =>
  ({
    loopCount: 0,
    maxLoopNestingDepth: 0,
    recursiveFunctions: [],
    imports: [],
    unusedImports: [],
    unusedVariables: [],
    deadCode: [],
    functionComplexity: [],
    fileCyclomaticComplexity: 1,
    maintainabilityIndex: 100,
    ast: {
      language: "python",
      imports: [],
      functions: [],
      variables: [],
      classes: [],
      loopCount: 0,
      recursiveFunctions: [],
      hasParseErrors: false,
      tokenCount: 0,
    },
    ...overrides,
  }) as StaticAnalysisResult;

describe("CodeSmellDetector", () => {
  it("detects long-method candidates", () => {
    const code = `def process():
${Array.from({ length: 81 }, (_, index) => `    value${String(index)} = ${String(index)}`).join("\n")}`;

    const issues = detectCodeSmells(
      code,
      analysis({
        ast: {
          language: "python",
          imports: [],
          functions: ["process"],
          variables: [],
          classes: [],
          loopCount: 0,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 0,
        },
      })
    );

    expect(issues.some((issue) => issue.type === "long-method")).toBe(true);
  });

  it("detects large-class candidates", () => {
    const issues = detectCodeSmells(
      "class A: pass\nclass B: pass\nclass C: pass\nclass D: pass",
      analysis({
        ast: {
          language: "python",
          imports: [],
          functions: [],
          variables: [],
          classes: ["A", "B", "C", "D"],
          loopCount: 0,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 0,
        },
      })
    );

    expect(issues.some((issue) => issue.type === "large-class")).toBe(true);
  });

  it("detects magic numbers", () => {
    const issues = detectCodeSmells("const timeout = 42;", analysis());

    expect(issues.some((issue) => issue.type === "magic-number")).toBe(true);
  });

  it("detects deep nesting", () => {
    const issues = detectCodeSmells(
      "for (;;) {}",
      analysis({
        maxLoopNestingDepth: 3,
      })
    );

    expect(issues.some((issue) => issue.type === "deep-nesting")).toBe(true);
  });

  it("detects duplicate code", () => {
    const code = ["calculateImportantValue();", "calculateImportantValue();"].join("\n");

    const issues = detectCodeSmells(code, analysis());

    expect(issues.some((issue) => issue.type === "duplicate-code")).toBe(true);
  });

  it("detects poor naming", () => {
    const issues = detectCodeSmells(
      "function foo() {}",
      analysis({
        ast: {
          language: "javascript",
          imports: [],
          functions: ["foo"],
          variables: [],
          classes: [],
          loopCount: 0,
          recursiveFunctions: [],
          hasParseErrors: false,
          tokenCount: 0,
        },
      })
    );

    expect(issues.some((issue) => issue.type === "poor-naming")).toBe(true);
  });

  it("returns no smells for clean code", () => {
    const issues = detectCodeSmells("const total = price * quantity;", analysis());

    expect(issues).toEqual([]);
  });
});
