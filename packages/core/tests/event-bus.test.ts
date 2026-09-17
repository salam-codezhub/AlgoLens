import { describe, expect, it } from "vitest";
import { EventBus } from "../src/event-bus.js";

interface TestEvents {
  analysisCompleted: { fileId: string; score: number };
  message: { text: string };
}

describe("EventBus", () => {
  it("emits payloads to subscribed handlers", () => {
    const bus = new EventBus<TestEvents>();
    let received: TestEvents["analysisCompleted"] | undefined;

    bus.on("analysisCompleted", (payload) => {
      received = payload;
    });

    bus.emit("analysisCompleted", { fileId: "test.ts", score: 95 });

    expect(received).toEqual({ fileId: "test.ts", score: 95 });
  });

  it("supports multiple listeners for the same event", () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];

    bus.on("message", (payload) => received.push(`first:${payload.text}`));
    bus.on("message", (payload) => received.push(`second:${payload.text}`));

    bus.emit("message", { text: "hello" });

    expect(received).toEqual(["first:hello", "second:hello"]);
  });

  it("removes a listener with unsubscribe", () => {
    const bus = new EventBus<TestEvents>();
    let calls = 0;

    const unsubscribe = bus.on("message", () => {
      calls += 1;
    });

    bus.emit("message", { text: "before" });
    unsubscribe();
    bus.emit("message", { text: "after" });

    expect(calls).toBe(1);
  });

  it("supports explicit off", () => {
    const bus = new EventBus<TestEvents>();
    let calls = 0;
    const handler = () => {
      calls += 1;
    };

    bus.on("message", handler);
    bus.off("message", handler);
    bus.emit("message", { text: "ignored" });

    expect(calls).toBe(0);
  });

  it("clear removes listeners from every event", () => {
    const bus = new EventBus<TestEvents>();
    let analysisCalls = 0;
    let messageCalls = 0;

    bus.on("analysisCompleted", () => {
      analysisCalls += 1;
    });
    bus.on("message", () => {
      messageCalls += 1;
    });

    bus.clear();
    bus.emit("analysisCompleted", { fileId: "test.ts", score: 90 });
    bus.emit("message", { text: "ignored" });

    expect(analysisCalls).toBe(0);
    expect(messageCalls).toBe(0);
  });
});
