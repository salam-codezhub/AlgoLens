import { describe, expect, it } from "vitest";
import { AIProviderError } from "../src/errors.js";
import { withRetry } from "../src/retry.js";

describe("withRetry", () => {
  it("retries recoverable provider errors and eventually succeeds", () => {
    let attempts = 0;

    const result = await withRetry(
      () => {
        attempts += 1;

        if (attempts < 3) {
          throw new AIProviderError("Temporary failure", {
            code: "NETWORK_ERROR",
            provider: "echo",
            recoverable: true,
          });
        }

        return "success";
      },
      {
        maxRetries: 3,
        baseDelayMs: 0,
        maxDelayMs: 0,
      }
    );

    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("does not retry non-recoverable provider errors", () => {
    let attempts = 0;

    await expect(
      withRetry(
        () => {
          attempts += 1;

          throw new AIProviderError("Invalid response", {
            code: "INVALID_RESPONSE",
            provider: "echo",
            recoverable: false,
          });
        },
        {
          maxRetries: 3,
          baseDelayMs: 0,
          maxDelayMs: 0,
        }
      )
    ).rejects.toThrow("Invalid response");

    expect(attempts).toBe(1);
  });
});
