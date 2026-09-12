export type EventHandler<TPayload> = (payload: TPayload) => void;

export type Unsubscribe = () => void;

/**
 * Typed publish/subscribe event bus.
 *
 * Per MASTER_03_ARCHITECTURE.md, modules communicate through this Event Bus
 * rather than calling each other directly — e.g. the eventual Analyzer
 * publishes `AnalysisCompleted`, and the Dashboard subscribes rather than
 * the Analyzer importing and calling into UI code. `TEventMap` is a record
 * mapping event names to their payload type, giving full type safety on
 * both `emit` and `on` without any casts.
 *
 * @example
 * ```ts
 * interface AppEvents {
 *   analysisCompleted: { fileId: string; score: number };
 * }
 * const bus = new EventBus<AppEvents>();
 * const unsubscribe = bus.on("analysisCompleted", ({ fileId, score }) => { ... });
 * bus.emit("analysisCompleted", { fileId: "a.ts", score: 87 });
 * unsubscribe();
 * ```
 */
export class EventBus<TEventMap extends Record<string, unknown>> {
  private readonly listeners: {
    [K in keyof TEventMap]?: Set<EventHandler<TEventMap[K]>>;
  } = {};

  on<TEvent extends keyof TEventMap>(
    event: TEvent,
    handler: EventHandler<TEventMap[TEvent]>
  ): Unsubscribe {
    const existing = this.listeners[event] ?? new Set();
    existing.add(handler);
    this.listeners[event] = existing;
    return () => {
      this.off(event, handler);
    };
  }

  off<TEvent extends keyof TEventMap>(
    event: TEvent,
    handler: EventHandler<TEventMap[TEvent]>
  ): void {
    this.listeners[event]?.delete(handler);
  }

  emit<TEvent extends keyof TEventMap>(event: TEvent, payload: TEventMap[TEvent]): void {
    for (const handler of this.listeners[event] ?? []) {
      handler(payload);
    }
  }

  /** Removes every listener for every event. Mainly useful in tests. */
  clear(): void {
    for (const key of Object.keys(this.listeners) as (keyof TEventMap)[]) {
      this.listeners[key]?.clear();
    }
  }
}
