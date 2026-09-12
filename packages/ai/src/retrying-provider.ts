import { BaseAIProvider } from "./base-provider.js";
import { withRetry, type RetryOptions } from "./retry.js";
import type { AIProvider, AIProviderId, ChatRequest, AIResponse, StreamChunk } from "./types.js";

/**
 * Wraps any {@link AIProvider} so `chat()` automatically retries on
 * recoverable errors (rate limits, transient network failures) with
 * exponential backoff.
 *
 * Extends {@link BaseAIProvider} rather than implementing {@link AIProvider}
 * directly so `analyze`/`optimize`/`explain`/`document`/`generateTests`
 * (inherited from the base class) call *this* class's retrying `chat()` —
 * not the wrapped provider's original one — without needing to redeclare
 * all five methods here.
 *
 * `streamChat` is intentionally *not* retried: once a stream has started
 * emitting content, silently restarting it from scratch would duplicate
 * output the caller already received. Retrying only applies before any
 * content has been produced, which is what `chat()` (and therefore every
 * task method) represents.
 */
export class RetryingProvider extends BaseAIProvider {
  readonly id: AIProviderId;

  constructor(
    private readonly inner: AIProvider,
    private readonly retryOptions: Partial<RetryOptions> = {}
  ) {
    super();
    this.id = inner.id;
  }

  chat(request: ChatRequest): Promise<AIResponse> {
    return withRetry(() => this.inner.chat(request), this.retryOptions);
  }

  streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    return this.inner.streamChat(request);
  }
}
