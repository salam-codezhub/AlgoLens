import type { ReactElement } from "react";
import { Outlet } from "react-router";
import { useAppState } from "../providers/app-state-provider.js";
import { useProjectContext } from "../providers/store-provider.js";
import { ActivityBar } from "./activity-bar.js";
import { Sidebar } from "./sidebar.js";

/**
 * Base application shell: header, ActivityBar (Phase 12), Sidebar
 * (Phase 13), and the routed page content. The header uses Phase 11's
 * `.glass` utility (translucent + backdrop-blur), matching CLAUDE.md's
 * glassmorphism direction. The footer reads {@link useProjectContext}
 * (Phase 15) — the same shared store the Dashboard header reads — so both
 * locations always agree, proving state is genuinely shared rather than
 * duplicated per-component.
 */
export function AppShell(): ReactElement {
  const { webviewPackageName, uiPackageName, sharedPackageName } = useAppState();
  const { currentFile } = useProjectContext();

  return (
    <div className="bg-background text-foreground flex h-full flex-col">
      <header className="glass sticky top-0 z-10 flex-none px-4 py-2">
        <span className="text-primary font-semibold">AlgoLens</span>
      </header>
      <div className="flex min-h-0 flex-1">
        <ActivityBar />
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
      <footer className="border-surface text-muted-foreground flex-none border-t px-4 py-1">
        <small className="font-mono text-xs" data-testid="footer-current-file">
          {currentFile} · {webviewPackageName} · {uiPackageName} · {sharedPackageName}
        </small>
      </footer>
    </div>
  );
}
