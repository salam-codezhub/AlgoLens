import Anthropic from "@anthropic-ai/sdk";
import { BaseAIProvider } from "../base-provider.js";
import {
  AIAuthenticationError,
  AIInvalidResponseError,
  AINetworkError,
  AIRateLimitError,
} from "../errors.js";
import type { AIProviderId, ChatRequest, AIResponse, StreamChunk } from "../types.js";

const DEFAULT_MAX_TOKENS = 4096;

/** Splits messages into Anthropic's separate `system` string + `messages`
 *  array shape (unlike OpenAI-style APIs, the Anthropic SDK doesn't accept
 *  a "system" role inside the messages array). */
function splitSystemPrompt(messages: ChatRequest["messages"]): {
  system: string | undefined;
  rest: { role: "user" | "assistant"; content: string }[];
} {
  const systemMessages = messages.filter((m) => m.role === "system");
  const rest = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return {
    system:
      systemMessages.length > 0 ? systemMessages.map((m) => m.content).join("\n\n") : undefined,
    rest,
  };
}

export class ClaudeProvider extends BaseAIProvider {
  readonly id: AIProviderId = "claude";
  private readonly client: Anthropic;
  private readonly defaultModel: string;

  constructor(apiKey: string, defaultModel = "claude-sonnet-5") {
    super();
    this.client = new Anthropic({ apiKey });
    this.defaultModel = defaultModel;
  }

  async chat(request: ChatRequest): Promise<AIResponse> {
    const start = Date.now();
    const { system, rest } = splitSystemPrompt(request.messages);

    try {
      const message = await this.client.messages.create({
        model: request.model ?? this.defaultModel,
        max_tokens: request.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
        messages: rest,
        ...(system !== undefined ? { system } : {}),
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      });

      const textBlock = message.content.find((block) => block.type === "text");
      if (!textBlock) {
        throw new AIInvalidResponseError(this.id, "response contained no text content block");
      }

      return {
        content: textBlock.text,
        model: message.model,
        provider: this.id,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      throw this.toProviderError(error);
    }
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const { system, rest } = splitSystemPrompt(request.messages);

    try {
      const stream = this.client.messages.stream({
        model: request.model ?? this.defaultModel,
        max_tokens: request.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
        messages: rest,
        ...(system !== undefined ? { system } : {}),
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield { delta: event.delta.text, done: false };
        }
        if (event.type === "message_stop") {
          const finalMessage = await stream.finalMessage();
          yield {
            delta: "",
            done: true,
            usage: {
              inputTokens: finalMessage.usage.input_tokens,
              outputTokens: finalMessage.usage.output_tokens,
              totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
            },
          };
        }
      }
    } catch (error) {
      throw this.toProviderError(error);
    }
  }

  private toProviderError(error: unknown): Error {
    if (error instanceof Anthropic.APIError) {
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
