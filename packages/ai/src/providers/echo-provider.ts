import { BaseAIProvider } from "../base-provider.js";
import { AINetworkError } from "../errors.js";
import type { AIProviderId, ChatRequest, AIResponse, StreamChunk } from "../types.js";

/** Rough token estimate: ~4 characters per token, a common approximation
 *  used when a provider doesn't return an exact tokenizer count. */
function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export interface EchoProviderOptions {
  /** Simulated per-call latency, so streaming/timing behavior is realistic. */
  readonly latencyMs?: number;
  /** Throws a recoverable AINetworkError on the first N calls, then succeeds
   *  — exists specifically to exercise `withRetry` end-to-end without
   *  needing a real flaky network. */
  readonly failFirstNCalls?: number;
}

/**
 * A real, fully-functional {@link AIProvider} that needs no API key and
 * makes no network calls. It doesn't call any LLM — it deterministically
 * echoes back a summary of the request. This exists so the whole
 * architecture (factory, registry, streaming, retry, token tracking) can
 * be exercised end-to-end in this environment, which has no AI provider
 * API keys and no network path to most providers' endpoints, and so the
 * five other providers can be unit-tested against a stand-in without
 * spending real API credits.
 */
export class EchoProvider extends BaseAIProvider {
  readonly id: AIProviderId = "echo";

  private callCount = 0;
  private readonly latencyMs: number;
  private readonly failFirstNCalls: number;

  constructor(options: EchoProviderOptions = {}) {
    super();
    this.latencyMs = options.latencyMs ?? 0;
    this.failFirstNCalls = options.failFirstNCalls ?? 0;
  }

  async chat(request: ChatRequest): Promise<AIResponse> {
    const start = Date.now();
    this.callCount += 1;

    if (this.callCount <= this.failFirstNCalls) {
      throw new AINetworkError(this.id, new Error(`Simulated failure #${String(this.callCount)}`));
    }

    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }

    const lastMessage = request.messages.at(-1);
    const lastMessagePreview = lastMessage ? lastMessage.content.slice(0, 80) : "";
    const content = `[echo] received ${String(request.messages.length)} message(s). Last: "${lastMessagePreview}"`;

    const inputTokens = estimateTokens(request.messages.map((m) => m.content).join("\n"));
    const outputTokens = estimateTokens(content);

    return {
      content,
      model: request.model ?? "echo-1",
      provider: this.id,
      usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      durationMs: Date.now() - start,
    };
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const response = await this.chat(request);
    const words = response.content.split(" ");

    for (const [i, word] of words.entries()) {
      if (this.latencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.latencyMs / words.length));
      }
      const isLast = i === words.length - 1;
      yield {
        delta: i === 0 ? word : ` ${word}`,
        done: isLast,
        ...(isLast ? { usage: response.usage } : {}),
      };
    }
  }
}
