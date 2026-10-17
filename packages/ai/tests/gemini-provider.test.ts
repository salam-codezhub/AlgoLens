import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, GoogleGenAI } from "@google/genai";
import {
  AIAuthenticationError,
  AIInvalidResponseError,
  AINetworkError,
  AIRateLimitError,
} from "../src/errors.js";
import { GeminiProvider } from "../src/providers/gemini-provider.js";

vi.mock("@google/genai", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(options: { status: number; message?: string }) {
      super(options.message ?? "API error");
      this.status = options.status;
    }
  },
  GoogleGenAI: vi.fn().mockImplementation(function () {
    return { models: { generateContent: vi.fn(), generateContentStream: vi.fn() } };
  }),
}));

const mockedGoogleGenAI = vi.mocked(GoogleGenAI);

function setupProvider() {
  const generateContent = vi.fn();
  const generateContentStream = vi.fn();

  mockedGoogleGenAI.mockImplementation(function () {
    return {
      models: { generateContent, generateContentStream },
    } as unknown as InstanceType<typeof GoogleGenAI>;
  });

  return {
    provider: new GeminiProvider("test-api-key"),
    generateContent,
    generateContentStream,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GeminiProvider error handling", () => {
  it("maps authentication failures to AIAuthenticationError", async () => {
    const { provider, generateContent } = setupProvider();
    generateContent.mockRejectedValue(new ApiError({ status: 401, message: "Unauthorized" }));

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toBeInstanceOf(AIAuthenticationError);
  });

  it("maps permission failures to AIAuthenticationError", async () => {
    const { provider, generateContent } = setupProvider();
    generateContent.mockRejectedValue(new ApiError({ status: 403, message: "Forbidden" }));

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toBeInstanceOf(AIAuthenticationError);
  });

  it("maps rate limits to AIRateLimitError", async () => {
    const { provider, generateContent } = setupProvider();
    generateContent.mockRejectedValue(new ApiError({ status: 429, message: "Rate limited" }));

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toBeInstanceOf(AIRateLimitError);
  });

  it("maps other API errors to AINetworkError", async () => {
    const { provider, generateContent } = setupProvider();
    generateContent.mockRejectedValue(
      new ApiError({ status: 500, message: "Internal server error" })
    );

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toBeInstanceOf(AINetworkError);
  });

  it("preserves AIInvalidResponseError when a response has no text", async () => {
    const { provider, generateContent } = setupProvider();
    generateContent.mockResolvedValue({ text: "" });

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toBeInstanceOf(AIInvalidResponseError);
  });

  it("does not expose raw unexpected error messages", async () => {
    const { provider, generateContent } = setupProvider();
    generateContent.mockRejectedValue(new Error("secret-key-or-sensitive-details"));

    let thrown: unknown;
    try {
      await provider.chat({ messages: [{ role: "user", content: "hello" }] });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AINetworkError);
    expect((thrown as Error).message).not.toContain("secret-key-or-sensitive-details");
  });
});
