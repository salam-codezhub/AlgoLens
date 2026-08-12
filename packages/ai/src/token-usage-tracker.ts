import type { AIProviderId, TokenUsage } from "./types.js";

export interface TokenUsageRecord extends TokenUsage {
  readonly provider: AIProviderId;
  readonly model: string;
  readonly timestamp: number;
}

/**
 * Tracks token usage across every AI call made through this instance,
 * regardless of which provider handled each call — the whole point of a
 * provider-independent architecture is that usage tracking works the same
 * way no matter which provider is configured.
 */
export class TokenUsageTracker {
  private readonly records: TokenUsageRecord[] = [];

  record(provider: AIProviderId, model: string, usage: TokenUsage): void {
    this.records.push({ ...usage, provider, model, timestamp: Date.now() });
  }

  getRecords(): readonly TokenUsageRecord[] {
    return this.records;
  }

  getTotalUsage(): TokenUsage {
    return this.records.reduce<TokenUsage>(
      (total, record) => ({
        inputTokens: total.inputTokens + record.inputTokens,
        outputTokens: total.outputTokens + record.outputTokens,
        totalTokens: total.totalTokens + record.totalTokens,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    );
  }

  getUsageByProvider(provider: AIProviderId): TokenUsage {
    return this.records
      .filter((record) => record.provider === provider)
      .reduce<TokenUsage>(
        (total, record) => ({
          inputTokens: total.inputTokens + record.inputTokens,
          outputTokens: total.outputTokens + record.outputTokens,
          totalTokens: total.totalTokens + record.totalTokens,
        }),
        { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      );
  }

  clear(): void {
    this.records.length = 0;
  }
}
