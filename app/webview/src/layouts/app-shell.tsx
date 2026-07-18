import type { ReactElement } from "react";
import { Outlet } from "react-router";
import { useAppState } from "../providers/app-state-provider.js";

/**
 * Base application shell: header, a placeholder nav rail, and the routed
 * page content. Layout responsibilities are unchanged from Phase 08 — the
 * real Activity Bar (Phase 12), Sidebar (Phase 13), and Dashboard content
 * (Phase 14) still land in later phases. The header now uses Phase 11's
 * `.glass` utility (translucent + backdrop-blur), matching CLAUDE.md's
 * glassmorphism direction.
 */
export function AppShell(): ReactElement {
  const { webviewPackageName, uiPackageName, sharedPackageName } = useAppState();

  return (
    <div className="bg-background text-foreground flex h-full flex-col">
      <header className="glass sticky top-0 z-10 flex-none px-4 py-2">
        <span className="text-primary font-semibold">AlgoLens</span>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Primary"
          className="bg-surface w-12 flex-none"
          // Real Activity Bar navigation arrives in Phase 12
        />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
      <footer className="border-surface text-muted-foreground flex-none border-t px-4 py-1">
        <small className="font-mono text-xs">
          {webviewPackageName} · {uiPackageName} · {sharedPackageName}
        </small>
      </footer>
    </div>
  );
}
