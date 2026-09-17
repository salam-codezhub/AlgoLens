import { describe, expect, it } from "vitest";
import { EchoProvider } from "../src/providers/echo-provider.js";

describe("EchoProvider", () => {
  it("returns a deterministic chat response with token usage", async () => {
    const provider = new EchoProvider();

    const response = await provider.chat({
      messages: [{ role: "user", content: "Hello AlgoLens" }],
    });

    expect(response.provider).toBe("echo");
    expect(response.model).toBe("echo-1");
    expect(response.content).toContain("[echo]");
    expect(response.usage.totalTokens).toBe(
      response.usage.inputTokens + response.usage.outputTokens
    );
    expect(response.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("streams the same response content in chunks", async () => {
    const provider = new EchoProvider();
    const chunks = [];

    for await (const chunk of provider.streamChat({
      messages: [{ role: "user", content: "Hello AlgoLens" }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.at(-1)?.done).toBe(true);
    expect(chunks.at(-1)?.usage).toBeDefined();

    const streamedContent = chunks.map((chunk) => chunk.delta).join("");
    expect(streamedContent).toContain("[echo]");
  });
});
