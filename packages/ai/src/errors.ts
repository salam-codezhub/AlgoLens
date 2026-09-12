import type { ServiceError } from "@algolens/shared";
import type { AIProviderId } from "./types.js";

export type AIErrorCode =
  | "AUTHENTICATION_FAILED"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE"
  | "TIMEOUT"
  | "UNKNOWN_PROVIDER"
  | "UNKNOWN";

/**
 * Base class for every error an {@link AIProvider} call can raise.
 * `recoverable` mirrors {@link ServiceError}'s field of the same name —
 * `toServiceError()` converts directly to that shared contract, so callers
 * elsewhere in the app get the one standard error shape (per
 * MASTER_06_API_DESIGN.md) instead of a second, AI-specific one.
 */
export class AIProviderError extends Error {
  readonly code: AIErrorCode;
  readonly provider: AIProviderId;
  readonly recoverable: boolean;
  override readonly cause?: Error;

  constructor(
    message: string,
    options: { code: AIErrorCode; provider: AIProviderId; recoverable: boolean; cause?: Error }
  ) {
    super(message);
    this.name = "AIProviderError";
    this.code = options.code;
    this.provider = options.provider;
    this.recoverable = options.recoverable;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }

  toServiceError(): ServiceError {
    return {
      code: this.code,
      message: this.message,
      recoverable: this.recoverable,
      ...(this.cause?.message !== undefined ? { cause: this.cause.message } : {}),
    };
  }
}

export class AIAuthenticationError extends AIProviderError {
  constructor(provider: AIProviderId, cause?: Error) {
    super(`Authentication failed for provider "${provider}". Check the configured API key.`, {
      code: "AUTHENTICATION_FAILED",
      provider,
      recoverable: false,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "AIAuthenticationError";
  }
}

export class AIRateLimitError extends AIProviderError {
  readonly retryAfterMs: number | undefined;

  constructor(provider: AIProviderId, retryAfterMs?: number, cause?: Error) {
    super(`Rate limited by provider "${provider}".`, {
      code: "RATE_LIMITED",
      provider,
      recoverable: true,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "AIRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export class AINetworkError extends AIProviderError {
  constructor(provider: AIProviderId, cause?: Error) {
    super(`Network error calling provider "${provider}".`, {
      code: "NETWORK_ERROR",
      provider,
      recoverable: true,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "AINetworkError";
  }
}

export class AIInvalidResponseError extends AIProviderError {
  constructor(provider: AIProviderId, reason: string, cause?: Error) {
    super(`Provider "${provider}" returned an invalid response: ${reason}`, {
      code: "INVALID_RESPONSE",
      provider,
      recoverable: false,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "AIInvalidResponseError";
  }
}

export class AITimeoutError extends AIProviderError {
  constructor(provider: AIProviderId, timeoutMs: number) {
    super(`Provider "${provider}" timed out after ${String(timeoutMs)}ms.`, {
      code: "TIMEOUT",
      provider,
      recoverable: true,
    });
    this.name = "AITimeoutError";
  }
}

export class UnknownProviderError extends Error {
  constructor(providerId: string) {
    super(
      `Unknown AI provider "${providerId}". Registered providers: openai, claude, gemini, deepseek, qwen, echo.`
    );
    this.name = "UnknownProviderError";
  }
}
