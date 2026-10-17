import { describe, expect, it, vi } from "vitest";
import type { AIProvider, AIProviderConfig, AIResponse } from "@algolens/ai";
import {
  explainWithProvider,
  formatExplanationReport,
  isConfiguredProvider,
  selectCode,
  runExplainCommand,
} from "../src/code-explainer.js";

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
    const explain = vi.fn(async () => response);
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

describe("runExplainCommand", () => {
  const editor = {
    selection: "return 1",
    documentText: "return 2",
    language: "typescript",
    filePath: "src/a.ts",
  };
  const makeDeps = (overrides: Record<string, unknown> = {}) => ({
    getEditor: vi.fn(() => editor),
    getProviderSetting: vi.fn(() => "openai"),
    getModelSetting: vi.fn(() => "test-model"),
    getApiKey: vi.fn(async () => "saved-key"),
    requestApiKey: vi.fn(async () => undefined),
    storeApiKey: vi.fn(async () => undefined),
    confirmRemoteDisclosure: vi.fn(async () => true),
    resolveInput: vi.fn((_editor: typeof editor, code: string) => ({
      language: "typescript",
      filePath: "src/a.ts",
      code,
    })),
    explain: vi.fn(async () => response),
    ...overrides,
  });

  it("returns no-editor", async () => {
    const deps = makeDeps({ getEditor: vi.fn(() => undefined) });
    expect(await runExplainCommand(deps as never)).toEqual({ kind: "no-editor" });
  });
  it("returns empty-code", async () => {
    const deps = makeDeps({
      getEditor: vi.fn(() => ({ ...editor, selection: " ", documentText: "" })),
    });
    expect(await runExplainCommand(deps as never)).toEqual({ kind: "empty-code" });
  });
  it("rejects unsupported providers", async () => {
    const deps = makeDeps({ getProviderSetting: vi.fn(() => "echo") });
    expect(await runExplainCommand(deps as never)).toEqual({ kind: "unsupported-provider" });
  });
  it("returns cancelled and does not store a missing key", async () => {
    const deps = makeDeps({
      getApiKey: vi.fn(async () => undefined),
      requestApiKey: vi.fn(async () => undefined),
    });
    expect(await runExplainCommand(deps as never)).toEqual({ kind: "cancelled" });
    expect(deps.storeApiKey).not.toHaveBeenCalled();
  });
  it("trims and stores a newly entered key", async () => {
    const deps = makeDeps({
      getApiKey: vi.fn(async () => undefined),
      requestApiKey: vi.fn(async () => "  new-secret  "),
    });
    expect((await runExplainCommand(deps as never)).kind).toBe("explained");
    expect(deps.storeApiKey).toHaveBeenCalledWith("openai", "new-secret");
  });
  it("requires explicit disclosure consent before sending code to the provider", async () => {
    const dependencies = makeDeps();
    dependencies.confirmRemoteDisclosure = vi.fn(async () => false);
    const outcome = await runExplainCommand(dependencies as never);
    expect(outcome).toEqual({ kind: "cancelled" });
    expect(dependencies.explain).not.toHaveBeenCalled();
  });

  it("requests disclosure consent before the provider call", async () => {
    const dependencies = makeDeps();
    dependencies.confirmRemoteDisclosure = vi.fn(async () => true);
    await runExplainCommand(dependencies as never);
    expect(dependencies.confirmRemoteDisclosure).toHaveBeenCalledWith("openai", "src/a.ts");
    expect(dependencies.explain).toHaveBeenCalledOnce();
  });

  it("returns cancelled without calling the provider when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const deps = makeDeps({ signal: controller.signal });
    await expect(runExplainCommand(deps as never)).resolves.toEqual({ kind: "cancelled" });
    expect(deps.explain).not.toHaveBeenCalled();
  });

  it("returns cancelled promptly when aborted while the provider is pending", async () => {
    const controller = new AbortController();
    const deps = makeDeps({
      signal: controller.signal,
      explain: vi.fn(
        () =>
          new Promise<typeof response>(() => {
            /* Intentionally remain pending until cancellation. */
          })
      ),
    });
    const pending = runExplainCommand(deps as never);
    // Wait for async setup to reach the provider call before cancelling.
    for (let i = 0; i < 10 && !deps.explain.mock.calls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(deps.explain).toHaveBeenCalledOnce();
    controller.abort();
    await expect(pending).resolves.toEqual({ kind: "cancelled" });
    expect(deps.explain).toHaveBeenCalledOnce();
  });

  it("remains cancelled if the provider rejects after abort", async () => {
    const controller = new AbortController();
    let rejectProvider!: (error: Error) => void;
    const deps = makeDeps({
      signal: controller.signal,
      explain: vi.fn(
        () =>
          new Promise<typeof response>((_resolve, reject) => {
            rejectProvider = reject;
          })
      ),
    });
    const pending = runExplainCommand(deps as never);
    // Wait for async setup to reach the provider call before cancelling.
    for (let i = 0; i < 10 && !deps.explain.mock.calls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(deps.explain).toHaveBeenCalledOnce();
    controller.abort();
    await expect(pending).resolves.toEqual({ kind: "cancelled" });
    rejectProvider(new Error("late provider failure"));
    await Promise.resolve();
    expect(deps.explain).toHaveBeenCalledOnce();
  });

  it("returns the successful explanation", async () => {
    const deps = makeDeps();
    expect(await runExplainCommand(deps as never)).toMatchObject({
      kind: "explained",
      response,
      input: { code: "return 1" },
    });
  });
  it("handles an empty response", async () => {
    const deps = makeDeps({ explain: vi.fn(async () => ({ ...response, content: " " })) });
    expect(await runExplainCommand(deps as never)).toEqual({ kind: "empty-response" });
  });
  it("handles provider exceptions", async () => {
    const deps = makeDeps({
      explain: vi.fn(async () => {
        throw new Error("provider failed");
      }),
    });
    expect(await runExplainCommand(deps as never)).toEqual({
      kind: "provider-error",
      provider: "openai",
      category: "unknown",
    });
  });

  it("returns a safe dependency-error outcome when reading the saved API key fails", async () => {
    const deps = makeDeps({
      getApiKey: vi.fn(async () => {
        throw new Error("secret-bearing storage failure");
      }),
    });
    await expect(runExplainCommand(deps as never)).resolves.toMatchObject({
      kind: "dependency-error",
    });
  });

  it("returns a safe dependency-error outcome when requesting an API key fails", async () => {
    const deps = makeDeps({
      getApiKey: vi.fn(async () => undefined),
      requestApiKey: vi.fn(async () => {
        throw new Error("prompt failure");
      }),
    });
    await expect(runExplainCommand(deps as never)).resolves.toMatchObject({
      kind: "dependency-error",
    });
  });

  it("returns a safe dependency-error outcome when storing an API key fails", async () => {
    const deps = makeDeps({
      getApiKey: vi.fn(async () => undefined),
      requestApiKey: vi.fn(async () => "new-key"),
      storeApiKey: vi.fn(async () => {
        throw new Error("secret-bearing storage failure");
      }),
    });
    await expect(runExplainCommand(deps as never)).resolves.toMatchObject({
      kind: "dependency-error",
    });
  });

  it("returns a safe dependency-error outcome when resolving editor context fails", async () => {
    const deps = makeDeps({
      resolveInput: vi.fn(() => {
        throw new Error("context failure");
      }),
    });
    await expect(runExplainCommand(deps as never)).resolves.toMatchObject({
      kind: "dependency-error",
    });
  });
});

describe("formatExplanationReport path metadata", () => {
  it("escapes newline and backtick characters in file paths", () => {
    const report = formatExplanationReport(
      {
        code: "x",
        language: "typescript",
        filePath: "src/`odd`" + String.fromCharCode(10) + "path.ts",
      },
      response
    );
    expect(report).toContain("src/\\`odd\\`\\npath.ts");
  });
});
