import { describe, expect, it } from "vitest";
import { createStore } from "../src/store.js";

interface TestState {
  count: number;
  label: string;
}

describe("createStore", () => {
  it("returns the initial state", () => {
    const store = createStore<TestState>({ count: 1, label: "initial" });

    expect(store.getState()).toEqual({ count: 1, label: "initial" });
  });

  it("merges partial state updates", () => {
    const store = createStore<TestState>({ count: 1, label: "initial" });

    store.setState({ count: 5 });

    expect(store.getState()).toEqual({ count: 5, label: "initial" });
  });

  it("supports functional state updates", () => {
    const store = createStore<TestState>({ count: 2, label: "initial" });

    store.setState((state) => ({ count: state.count + 3 }));

    expect(store.getState()).toEqual({ count: 5, label: "initial" });
  });

  it("notifies subscribers after updates", () => {
    const store = createStore<TestState>({ count: 1, label: "initial" });
    const received: TestState[] = [];

    store.subscribe((state) => {
      received.push(state);
    });

    store.setState({ count: 4 });

    expect(received).toEqual([{ count: 4, label: "initial" }]);
  });

  it("stops notifying an unsubscribed listener", () => {
    const store = createStore<TestState>({ count: 1, label: "initial" });
    let calls = 0;

    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });

    store.setState({ count: 2 });
    unsubscribe();
    store.setState({ count: 3 });

    expect(calls).toBe(1);
  });
});
