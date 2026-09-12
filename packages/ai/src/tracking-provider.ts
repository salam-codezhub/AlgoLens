import { BaseAIProvider } from "./base-provider.js";
import type { TokenUsageTracker } from "./token-usage-tracker.js";
import type { AIProvider, AIProviderId, ChatRequest, AIResponse, StreamChunk } from "./types.js";

/**
 * Wraps any {@link AIProvider} so every successful `chat()` call records
 * its usage into the given {@link TokenUsageTracker}. Same extends-
 * BaseAIProvider pattern as {@link RetryingProvider}, for the same reason:
 * the inherited task methods then get tracked automatically too.
 */
export class TrackingProvider extends BaseAIProvider {
  readonly id: AIProviderId;

  constructor(
    private readonly inner: AIProvider,
    private readonly tracker: TokenUsageTracker
  ) {
    super();
    this.id = inner.id;
  }

  async chat(request: ChatRequest): Promise<AIResponse> {
    const response = await this.inner.chat(request);
    this.tracker.record(response.provider, response.model, response.usage);
    return response;
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    for await (const chunk of this.inner.streamChat(request)) {
      if (chunk.done && chunk.usage) {
        this.tracker.record(this.id, request.model ?? "unknown", chunk.usage);
      }
      yield chunk;
    }
  }
}
