import type { ReactElement, ReactNode } from "react";
import { AppStateProvider } from "./app-state-provider.js";
import { StoreProvider } from "./store-provider.js";
import { ThemeProvider } from "./theme-provider.js";

/**
 * Single composition point for every context provider the app needs.
 *
 * {@link ThemeProvider} wraps outermost so theme classes apply to <html>
 * before anything else renders. Later phases can add more providers here
 * without changing how `main.tsx` mounts the app or how pages consume state.
 */
export function AppProviders({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <StoreProvider>{children}</StoreProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}
