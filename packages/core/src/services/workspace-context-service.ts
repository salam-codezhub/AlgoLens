export interface RecentAnalysisEntry {
  readonly filePath: string;
  readonly summary: string;
  readonly timestamp: number;
}

/**
 * Everything MASTER_02_PHASES.md's Phase 18 lists under "Collect":
 * Workspace, Files, Language, Imports, Dependencies, Project Structure,
 * Selected File, Selected Function, Open Editors, Recent Analysis.
 *
 * Several fields are honestly empty/undefined until the engines that
 * produce real data exist:
 *  - `imports` per-file needs real parsing (Phase 20, AST Parsing Engine) —
 *    populated for now only at the aggregate/dependency level (see
 *    `dependencies`, which *is* available today from package.json).
 *  - `selectedFunction` needs AST-aware cursor-position resolution
 *    (Phase 20) — always `undefined` until then, never guessed from
 *    surrounding text.
 *  - `recentAnalysis` needs the Local Database & History engine
 *    (Phase 36) — always `[]` until then.
 * This type's shape doesn't change when those land; only who populates
 * which field does.
 */
export interface WorkspaceContext {
  readonly workspaceName: string | undefined;
  /** Workspace-relative file paths. */
  readonly files: readonly string[];
  /** Best-effort dominant language, if determinable. */
  readonly language: string | undefined;
  readonly imports: readonly string[];
  /** From package.json's dependencies + devDependencies, when present. */
  readonly dependencies: readonly string[];
  /** Top-level entries directly under the workspace root. */
  readonly projectStructure: readonly string[];
  readonly selectedFile: string | undefined;
  readonly selectedFunction: string | undefined;
  /** Workspace-relative paths of currently open editors. */
  readonly openEditors: readonly string[];
  readonly recentAnalysis: readonly RecentAnalysisEntry[];
}

export interface WorkspaceContextService {
  getWorkspaceContext(): Promise<WorkspaceContext>;
}

const EMPTY_WORKSPACE_CONTEXT: WorkspaceContext = {
  workspaceName: undefined,
  files: [],
  language: undefined,
  imports: [],
  dependencies: [],
  projectStructure: [],
  selectedFile: undefined,
  selectedFunction: undefined,
  openEditors: [],
  recentAnalysis: [],
};

/**
 * Working mock implementation of {@link WorkspaceContextService}, for use
 * anywhere that isn't the real VS Code extension host (tests, the
 * webview's own dev/demo mode). The real implementation
 * (`VsCodeWorkspaceContextService`) lives in `apps/extension` — packages
 * under `packages/*` never import the `vscode` module directly, per
 * CLAUDE.md's folder rules.
 */
export function createMockWorkspaceContextService(): WorkspaceContextService {
  const context: WorkspaceContext = {
    ...EMPTY_WORKSPACE_CONTEXT,
    workspaceName: "AlgoLens",
    files: ["src/index.ts", "src/services/order-processor.ts", "package.json"],
    language: "TypeScript",
    dependencies: ["react", "typescript", "vite"],
    projectStructure: ["src", "apps", "packages", "package.json"],
    selectedFile: "src/services/order-processor.ts",
    openEditors: ["src/services/order-processor.ts", "src/index.ts"],
  };

  return {
    getWorkspaceContext(): Promise<WorkspaceContext> {
      return Promise.resolve(context);
    },
  };
}
