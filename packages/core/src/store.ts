import type { Unsubscribe } from "./event-bus.js";

export interface Store<TState> {
  getState: () => TState;
  setState: (update: Partial<TState> | ((state: TState) => Partial<TState>)) => void;
  subscribe: (listener: (state: TState) => void) => Unsubscribe;
}

/**
 * Minimal reactive state container: `getState`/`setState`/`subscribe`.
 *
 * Deliberately framework-agnostic (no React import here) so it can be used
 * from `apps/extension` too, not just the webview — matching CLAUDE.md's
 * "Business logic -> packages/*" rule. `apps/webview` wraps this in a thin
 * React context/hook (see `apps/webview/src/providers/store-provider.tsx`)
 * rather than duplicating state logic in the UI layer.
 */
export function createStore<TState extends object>(initialState: TState): Store<TState> {
  let state = initialState;
  const listeners = new Set<(state: TState) => void>();

  return {
    getState(): TState {
      return state;
    },
    setState(update): void {
      const partial = typeof update === "function" ? update(state) : update;
      state = { ...state, ...partial };
      for (const listener of listeners) {
        listener(state);
      }
    },
    subscribe(listener): Unsubscribe {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
