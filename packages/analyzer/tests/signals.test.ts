import { describe, expect, it } from "vitest";
import {
  hasHalvingComputation,
  hasKeyword,
  hasLoop,
  hasNestedLoop,
  hasPattern,
  hasRecursion,
  hasSwapPattern,
} from "../src/algorithms/signals.js";
import type { AlgorithmDetectionContext } from "../src/algorithms/types.js";

const context = (
  code: string,
  overrides: Partial<AlgorithmDetectionContext["analysis"]> = {}
): AlgorithmDetectionContext => ({
  code,
  normalizedCode: code.toLowerCase(),
  analysis: {
    recursiveFunctions: [],
    loopCount: 0,
    maxLoopNestingDepth: 0,
    ...overrides,
  } as AlgorithmDetectionContext["analysis"],
});

describe("Algorithm signals", () => {
  it("matches keywords across normal and camelCase identifiers", () => {
    expect(hasKeyword(context("const windowSum = 10;"), "window")).toBe(true);
    expect(hasKeyword(context("const append = 10;"), "end")).toBe(false);
  });

  it("matches regular expression patterns", () => {
    expect(hasPattern(context("queue.push(item);"), /queue\.push/)).toBe(true);
    expect(hasPattern(context("stack.push(item);"), /queue\.push/)).toBe(false);
  });

  it("detects recursion from analysis", () => {
    expect(
      hasRecursion(
        context("factorial(n);", {
          recursiveFunctions: ["factorial"],
        })
      )
    ).toBe(true);
    expect(hasRecursion(context("factorial(n);"))).toBe(false);
  });

  it("detects loops and nested loops", () => {
    expect(
      hasLoop(
        context("for (const item of items) {}", {
          loopCount: 1,
        })
      )
    ).toBe(true);

    expect(
      hasNestedLoop(
        context("nested loops", {
          maxLoopNestingDepth: 2,
        })
      )
    ).toBe(true);

    expect(
      hasNestedLoop(
        context("single loop", {
          maxLoopNestingDepth: 1,
        })
      )
    ).toBe(false);
  });

  it("detects paired-bound and single-operand halving computations", () => {
    expect(hasHalvingComputation(context("const mid = (low + high) / 2;"))).toBe(true);
    expect(hasHalvingComputation(context("const half = length / 2;"))).toBe(true);
    expect(hasHalvingComputation(context("const total = length - 2;"))).toBe(false);
  });

  it("detects temporary and destructuring swap patterns", () => {
    expect(hasSwapPattern(context("temp = a; a = b; b = temp;"))).toBe(true);
    expect(hasSwapPattern(context("[a, b] = [b, a];"))).toBe(true);
    expect(hasSwapPattern(context("a = b;"))).toBe(false);
  });
});
