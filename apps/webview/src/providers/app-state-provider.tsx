import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { PACKAGE_NAME as UI_PACKAGE_NAME } from "@algolens/ui";
import { PACKAGE_NAME as SHARED_PACKAGE_NAME } from "@algolens/shared";

/** Canonical package name, useful for logging and diagnostics. */
export const PACKAGE_NAME = "@algolens/webview" as const;

export interface AppState {
  readonly webviewPackageName: string;
  readonly uiPackageName: string;
  readonly sharedPackageName: string;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const APP_STATE: AppState = {
  webviewPackageName: PACKAGE_NAME,
  uiPackageName: UI_PACKAGE_NAME,
  sharedPackageName: SHARED_PACKAGE_NAME,
};

/**
 * Provides read-only, app-wide diagnostic state to the component tree.
 *
 * Deliberately minimal for Phase 08 — proves the provider pattern and
 * workspace package wiring work end-to-end inside a real render. Real
 * application state (current project, active file, scan status — see
 * MASTER_04_UI_GUIDE.md's Dashboard Header) is wired up once the extension
 * host <-> webview message-passing bridge exists in a later phase.
 */
export function AppStateProvider({ children }: { readonly children: ReactNode }): ReactElement {
  return <AppStateContext.Provider value={APP_STATE}>{children}</AppStateContext.Provider>;
}

/** Reads the current {@link AppState}. Must be used within an {@link AppStateProvider}. */
export function useAppState(): AppState {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return state;
}
