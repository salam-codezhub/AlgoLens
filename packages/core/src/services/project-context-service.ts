export type ScanStatus = "idle" | "scanning" | "complete" | "error";

/**
 * Canonical shared model for "what project/file is currently active."
 * Consumed by any UI that needs it (Dashboard header, Sidebar, status
 * indicators, ...) via the store — see
 * `apps/webview/src/providers/store-provider.tsx`.
 */
export interface ProjectContext {
  readonly projectName: string;
  readonly currentFile: string;
  readonly language: string;
  readonly scanStatus: ScanStatus;
}

export interface ProjectContextService {
  getProjectContext(): ProjectContext;
}

/**
 * Working mock implementation of {@link ProjectContextService}.
 *
 * Real project/file/language data requires the extension-host <-> webview
 * message-passing bridge and the Workspace Context Engine (Phase 18),
 * neither of which exists yet. This mock is a real, working implementation
 * of the *interface* — not a stub — so callers write against the same
 * contract a real implementation will satisfy later; only this factory
 * function gets swapped out, nothing that consumes
 * {@link ProjectContextService} needs to change.
 */
export function createMockProjectContextService(): ProjectContextService {
  const context: ProjectContext = {
    projectName: "AlgoLens",
    currentFile: "src/services/order-processor.ts",
    language: "TypeScript",
    scanStatus: "complete",
  };

  return {
    getProjectContext(): ProjectContext {
      return context;
    },
  };
}
