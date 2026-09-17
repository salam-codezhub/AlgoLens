import { describe, expect, it } from "vitest";
import { TokenUsageTracker } from "../src/token-usage-tracker.js";

describe("TokenUsageTracker", () => {
  it("records usage and calculates totals", () => {
    const tracker = new TokenUsageTracker();

    tracker.record("openai", "test-model", {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    });

    tracker.record("openai", "test-model", {
      inputTokens: 40,
      outputTokens: 20,
      totalTokens: 60,
    });

    expect(tracker.getRecords()).toHaveLength(2);
    expect(tracker.getTotalUsage()).toEqual({
      inputTokens: 140,
      outputTokens: 70,
      totalTokens: 210,
    });
  });

  it("filters usage by provider and clears records", () => {
    const tracker = new TokenUsageTracker();

    tracker.record("openai", "model-a", {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    });

    tracker.record("gemini", "model-b", {
      inputTokens: 30,
      outputTokens: 20,
      totalTokens: 50,
    });

    expect(tracker.getUsageByProvider("openai")).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    });

    tracker.clear();

    expect(tracker.getRecords()).toHaveLength(0);
    expect(tracker.getTotalUsage()).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    });
  });
});
