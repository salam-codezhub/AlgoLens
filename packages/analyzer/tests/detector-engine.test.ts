import { describe, expect, it } from "vitest";
import { runDetector, type AlgorithmDetector } from "../src/algorithms/detector-engine.js";
import type { AlgorithmDetectionContext } from "../src/algorithms/types.js";

const context: AlgorithmDetectionContext = {
  code: "sample code",
  normalizedCode: "sample code",
  analysis: {} as AlgorithmDetectionContext["analysis"],
};

const signal = (description: string, weight: number, result: boolean) => ({
  description,
  weight,
  test: () => result,
});

describe("AlgorithmDetectorEngine", () => {
  it("returns null when a disqualifier matches", () => {
    const detector: AlgorithmDetector = {
      algorithm: "binary-search",
      signals: [signal("primary", 10, true)],
      minSignalsRequired: 1,
      disqualifiers: [signal("disqualifier", 10, true)],
    };

    expect(runDetector(detector, context)).toBeNull();
  });

  it("returns null when too few signals match", () => {
    const detector: AlgorithmDetector = {
      algorithm: "binary-search",
      signals: [signal("first", 10, true), signal("second", 10, false)],
      minSignalsRequired: 2,
    };

    expect(runDetector(detector, context)).toBeNull();
  });

  it("calculates confidence from matched signal weights", () => {
    const detector: AlgorithmDetector = {
      algorithm: "binary-search",
      signals: [signal("strong signal", 30, true), signal("weak signal", 10, false)],
      minSignalsRequired: 1,
    };

    const result = runDetector(detector, context);

    expect(result?.algorithm).toBe("binary-search");
    expect(result?.confidence).toBe(75);
    expect(result?.matchedSignals).toEqual(["strong signal"]);
  });

  it("caps confidence at 85", () => {
    const detector: AlgorithmDetector = {
      algorithm: "bubble-sort",
      signals: [signal("signal one", 50, true), signal("signal two", 50, true)],
      minSignalsRequired: 1,
    };

    const result = runDetector(detector, context);

    expect(result?.confidence).toBe(85);
    expect(result?.matchedSignals).toEqual(["signal one", "signal two"]);
  });
});
