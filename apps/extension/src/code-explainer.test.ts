import { describe, expect, it, vi } from "vitest";
import type { AIProvider, AIProviderConfig, AIResponse } from "@algolens/ai";
import {
  explainWithProvider,
  formatExplanationReport,
  isConfiguredProvider,
  selectCode,
} from "./code-explainer.js";

const response: AIResponse = {
  content: "This function adds two numbers.",
  model: "test-model",
  provider: "openai",
  usage: { inputTokens: 12, outputTokens: 8, totalTokens: 20 },
  durationMs: 10,
};

describe("code explainer", () => {
  it("uses a non-empty selection and otherwise falls back to the document", () => {
    expect(selectCode(" const x = 1; ", "full file")).toBe(" const x = 1; ");
    expect(selectCode("  ", "full file")).toBe("full file");
  });

  it("formats the provider response into a markdown report", () => {
    const report = formatExplanationReport(
      { code: "const x = 1;", language: "typescript", filePath: "src/file.ts" },
      response
    );
    expect(report).toContain("src/file.ts");
    expect(report).toContain("typescript");
    expect(report).toContain("openai");
    expect(report).toContain("test-model");
    expect(report).toContain("This function adds two numbers.");
  });

  it("accepts supported remote providers but rejects echo and unknown values", () => {
    expect(isConfiguredProvider("openai")).toBe(true);
    expect(isConfiguredProvider("qwen")).toBe(true);
    expect(isConfiguredProvider("echo")).toBe(false);
    expect(isConfiguredProvider("other")).toBe(false);
  });

  it("passes source context to the configured provider and returns its response", async () => {
    const explain = vi.fn(() => Promise.resolve(response));
    const provider = { explain } as unknown as AIProvider;
    const factory = vi.fn((_config: AIProviderConfig) => provider);
    const result = await explainWithProvider(
      { provider: "openai", apiKey: "test-secret" },
      { code: "return a + b", language: "typescript", filePath: "src/math.ts" },
      factory
    );
    expect(factory).toHaveBeenCalledOnce();
    expect(explain).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "return a + b",
        language: "typescript",
        filePath: "src/math.ts",
      })
    );
    expect(result).toBe(response);
  });
});
