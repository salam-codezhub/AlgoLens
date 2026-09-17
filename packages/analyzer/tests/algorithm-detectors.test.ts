import { describe, expect, it } from "vitest";
import { ALGORITHM_DETECTORS } from "../src/algorithms/algorithm-detectors.js";

describe("Algorithm detector definitions", () => {
  it("defines all fourteen supported algorithms", () => {
    expect(ALGORITHM_DETECTORS).toHaveLength(14);

    expect(ALGORITHM_DETECTORS.map((detector) => detector.algorithm)).toEqual([
      "binary-search",
      "merge-sort",
      "quick-sort",
      "bubble-sort",
      "dfs",
      "bfs",
      "trie",
      "heap",
      "sliding-window",
      "greedy",
      "dynamic-programming",
      "backtracking",
      "hashmap",
      "two-pointer",
    ]);
  });

  it("gives every detector signals and a valid minimum signal requirement", () => {
    for (const detector of ALGORITHM_DETECTORS) {
      expect(detector.signals.length).toBeGreaterThan(0);
      expect(detector.minSignalsRequired).toBeGreaterThan(0);
      expect(detector.minSignalsRequired).toBeLessThanOrEqual(detector.signals.length);

      for (const signal of detector.signals) {
        expect(signal.description.length).toBeGreaterThan(0);
        expect(signal.weight).toBeGreaterThan(0);
        expect(signal.test).toBeTypeOf("function");
      }
    }
  });

  it("includes disqualifiers only with valid signal definitions", () => {
    for (const detector of ALGORITHM_DETECTORS) {
      for (const signal of detector.disqualifiers ?? []) {
        expect(signal.description.length).toBeGreaterThan(0);
        expect(signal.weight).toBeGreaterThan(0);
        expect(signal.test).toBeTypeOf("function");
      }
    }
  });
});
