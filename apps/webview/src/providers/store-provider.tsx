import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import { createStore, createMockProjectContextService, type ProjectContext } from "@algolens/core";

/**
 * Thin React binding for `packages/core`'s framework-agnostic `Store`.
 *
 * All the actual state logic (get/set/subscribe) lives in `@algolens/core`
 * — this file only adapts it to React via `useSyncExternalStore`, the
 * correct primitive for subscribing to state that lives outside React
 * (avoids the tearing issues a manual useEffect+useState subscription can
 * have). `apps/extension` can use the same `createStore`/service pattern
 * without any of this React-specific code.
 */
const projectContextStore = createStore<ProjectContext>(
  createMockProjectContextService().getProjectContext()
);

const StoreContext = createContext(projectContextStore);

export function StoreProvider({ children }: { readonly children: ReactNode }): ReactElement {
  return <StoreContext.Provider value={projectContextStore}>{children}</StoreContext.Provider>;
}

/** Reads the current {@link ProjectContext}, re-rendering on every store update. */
export function useProjectContext(): ProjectContext {
  const store = useContext(StoreContext);
  return useSyncExternalStore(store.subscribe, store.getState);
}
