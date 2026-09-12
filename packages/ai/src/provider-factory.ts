import { UnknownProviderError } from "./errors.js";
import { buildProvider, getRegisteredProviderIds } from "./provider-registry.js";
import { RetryingProvider } from "./retrying-provider.js";
import type { AIProvider, AIProviderConfig } from "./types.js";

/**
 * Creates an {@link AIProvider} from configuration alone — this is the one
 * function business logic elsewhere should call. Swapping providers is a
 * config change (`{ provider: "claude", ... }` -> `{ provider: "gemini", ... }`),
 * never a code change, satisfying Phase 16's acceptance criteria directly.
 *
 * `config.provider` is typed as {@link AIProviderId} at compile time, but
 * this also validates at runtime — configuration can come from untrusted
 * sources (a settings file, VS Code configuration) where TypeScript's
 * compile-time guarantee doesn't apply.
 *
 * The returned provider automatically retries transient failures (see
 * {@link RetryingProvider}) — callers never need to implement retry logic
 * themselves.
 */
export function createProvider(config: AIProviderConfig): AIProvider {
  if (!getRegisteredProviderIds().includes(config.provider)) {
    throw new UnknownProviderError(config.provider);
  }
  const provider = buildProvider(config);
  return new RetryingProvider(
    provider,
    config.maxRetries !== undefined ? { maxRetries: config.maxRetries } : {}
  );
}
