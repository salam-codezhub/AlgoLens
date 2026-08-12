import { GoogleGenAI } from "@google/genai";
import { BaseAIProvider } from "../base-provider.js";
import { AIInvalidResponseError, AINetworkError } from "../errors.js";
import type { AIProviderId, ChatRequest, AIResponse, StreamChunk } from "../types.js";

/** Gemini has no separate "system" role — the SDK's `contents` array uses
 *  only "user"/"model" roles, so system messages get folded into the
 *  first user turn instead. */
function toGeminiContents(
  messages: ChatRequest["messages"]
): { role: "user" | "model"; parts: { text: string }[] }[] {
  const systemMessages = messages.filter((m) => m.role === "system");
  const systemPrefix =
    systemMessages.length > 0 ? `${systemMessages.map((m) => m.content).join("\n\n")}\n\n` : "";

  const conversational = messages.filter((m) => m.role !== "system");
  return conversational.map((m, index) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: index === 0 ? systemPrefix + m.content : m.content }],
  }));
}

export class GeminiProvider extends BaseAIProvider {
  readonly id: AIProviderId = "gemini";
  private readonly client: GoogleGenAI;
  private readonly defaultModel: string;

  constructor(apiKey: string, defaultModel = "gemini-2.5-flash") {
    super();
    this.client = new GoogleGenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  async chat(request: ChatRequest): Promise<AIResponse> {
    const start = Date.now();
    try {
      const response = await this.client.models.generateContent({
        model: request.model ?? this.defaultModel,
        contents: toGeminiContents(request.messages),
      });

      const text = response.text;
      if (text === undefined || text === "") {
        throw new AIInvalidResponseError(this.id, "response contained no text");
      }

      return {
        content: text,
        model: request.model ?? this.defaultModel,
        provider: this.id,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      throw this.toProviderError(error);
    }
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    try {
      const stream = await this.client.models.generateContentStream({
        model: request.model ?? this.defaultModel,
        contents: toGeminiContents(request.messages),
      });

      for await (const chunk of stream) {
        const isLast = chunk.usageMetadata !== undefined;
        yield {
          delta: chunk.text ?? "",
          done: isLast,
          ...(isLast
            ? {
                usage: {
                  inputTokens: chunk.usageMetadata?.promptTokenCount ?? 0,
                  outputTokens: chunk.usageMetadata?.candidatesTokenCount ?? 0,
                  totalTokens: chunk.usageMetadata?.totalTokenCount ?? 0,
                },
              }
            : {}),
        };
      }
    } catch (error) {
      throw this.toProviderError(error);
    }
  }

  private toProviderError(error: unknown): Error {
    if (error instanceof AIInvalidResponseError) {
      return error;
    }
    return new AINetworkError(this.id, error instanceof Error ? error : undefined);
  }
}
