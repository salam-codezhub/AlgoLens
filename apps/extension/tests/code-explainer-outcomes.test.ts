import { describe, expect, it, vi } from "vitest";
import type { AIResponse } from "@algolens/ai";
import {
  presentExplainOutcome,
  type ExplainCommandOutcome,
  type ExplainOutcomeUi,
} from "../src/code-explainer.js";

const response: AIResponse = {
  content: "Explanation body",
  model: "test-model",
  provider: "openai",
  usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
  durationMs: 5,
};

function makeUi(): ExplainOutcomeUi {
  return {
    showWarning: vi.fn(),
    showError: vi.fn(),
    showReport: vi.fn(async () => undefined),
  };
}

describe("presentExplainOutcome", () => {
  it.each([
    ["no-editor", "Open a source file before requesting an AI code explanation."],
    ["empty-code", "Select code or open a non-empty source file to explain."],
    ["empty-response", "The AI provider returned an empty explanation. Please try again."],
  ] as const)("shows the warning for %s", async (kind, message) => {
    const ui = makeUi();
    await presentExplainOutcome({ kind } as ExplainCommandOutcome, ui);
    expect(ui.showWarning).toHaveBeenCalledWith(message);
    expect(ui.showError).not.toHaveBeenCalled();
    expect(ui.showReport).not.toHaveBeenCalled();
  });

  it("shows unsupported-provider and provider-specific errors", async () => {
    const ui = makeUi();
    await presentExplainOutcome({ kind: "unsupported-provider" }, ui);
    expect(ui.showError).toHaveBeenCalledWith(
      expect.stringContaining("Unsupported AlgoLens AI provider")
    );
    await presentExplainOutcome({ kind: "provider-error", provider: "gemini" }, ui);
    expect(ui.showError).toHaveBeenCalledWith(expect.stringContaining("gemini"));
  });

  it("does nothing when API-key entry is cancelled", async () => {
    const ui = makeUi();
    await presentExplainOutcome({ kind: "cancelled" }, ui);
    expect(ui.showWarning).not.toHaveBeenCalled();
    expect(ui.showError).not.toHaveBeenCalled();
    expect(ui.showReport).not.toHaveBeenCalled();
  });

  it("opens a Markdown report on success", async () => {
    const ui = makeUi();
    await presentExplainOutcome(
      {
        kind: "explained",
        provider: "openai",
        input: { code: "return 1", language: "typescript", filePath: "src/example.ts" },
        response,
      },
      ui
    );
    expect(ui.showReport).toHaveBeenCalledWith(
      expect.stringContaining("# AlgoLens Code Explanation")
    );
    expect(ui.showReport).toHaveBeenCalledWith(expect.stringContaining("Explanation body"));
    expect(ui.showWarning).not.toHaveBeenCalled();
    expect(ui.showError).not.toHaveBeenCalled();
  });

  it("shows a generic error for configuration or editor-context dependency failures", async () => {
    const ui = makeUi();
    await presentExplainOutcome({ kind: "dependency-error" }, ui);
    expect(ui.showError).toHaveBeenCalledWith(
      expect.stringContaining("could not access the AI configuration")
    );
    expect(ui.showWarning).not.toHaveBeenCalled();
    expect(ui.showReport).not.toHaveBeenCalled();
  });
});
