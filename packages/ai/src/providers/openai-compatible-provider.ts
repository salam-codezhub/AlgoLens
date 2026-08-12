import OpenAI from "openai";
import { BaseAIProvider } from "../base-provider.js";
import {
  AIAuthenticationError,
  AIInvalidResponseError,
  AINetworkError,
  AIRateLimitError,
} from "../errors.js";
import type { AIProviderId, ChatRequest, AIResponse, StreamChunk } from "../types.js";

export interface OpenAICompatibleOptions {
  readonly id: AIProviderId;
  readonly apiKey: string;
  /** DeepSeek and Qwen(DashScope) are OpenAI-API-compatible but hosted at
   *  different base URLs — verified against each provider's own docs, not
   *  assumed from OpenAI compatibility claims alone. */
  readonly baseURL?: string;
  readonly defaultModel: string;
}

/**
 * Base implementation for any provider that speaks the OpenAI Chat
 * Completions API — OpenAI itself, plus DeepSeek and Qwen, both of which
 * document genuine compatibility with this API shape (same request/response
 * fields, same streaming chunk format), not just superficial similarity.
 * Concrete subclasses only supply id/baseURL/defaultModel.
 */
export class OpenAICompatibleProvider extends BaseAIProvider {
  readonly id: AIProviderId;
  private readonly client: OpenAI;
  private readonly defaultModel: string;

  constructor(options: OpenAICompatibleOptions) {
    super();
    this.id = options.id;
    this.defaultModel = options.defaultModel;
    this.client = new OpenAI({
      apiKey: options.apiKey,
      ...(options.baseURL !== undefined ? { baseURL: options.baseURL } : {}),
    });
  }

  async chat(request: ChatRequest): Promise<AIResponse> {
    const start = Date.now();
    try {
      const completion = await this.client.chat.completions.create({
        model: request.model ?? this.defaultModel,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(request.maxOutputTokens !== undefined ? { max_tokens: request.maxOutputTokens } : {}),
      });

      const content = completion.choices[0]?.message.content;
      if (content === null || content === undefined) {
        throw new AIInvalidResponseError(this.id, "response contained no message content");
      }

      return {
        content,
        model: completion.model,
        provider: this.id,
        usage: {
          inputTokens: completion.usage?.prompt_tokens ?? 0,
          outputTokens: completion.usage?.completion_tokens ?? 0,
          totalTokens: completion.usage?.total_tokens ?? 0,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      throw this.toProviderError(error);
    }
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    try {
      const stream = await this.client.chat.completions.create({
        model: request.model ?? this.defaultModel,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta.content ?? "";
        const finished = chunk.choices[0]?.finish_reason !== null;
        yield { delta, done: finished };
      }
    } catch (error) {
      throw this.toProviderError(error);
    }
  }

  private toProviderError(error: unknown): Error {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401 || error.status === 403) {
        return new AIAuthenticationError(this.id, error);
      }
      if (error.status === 429) {
        return new AIRateLimitError(this.id, undefined, error);
      }
      return new AINetworkError(this.id, error);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
