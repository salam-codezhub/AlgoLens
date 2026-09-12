import type { WorkspaceContext } from "@algolens/core";
import type { AIContext } from "../types.js";
import type { PromptContext } from "./types.js";

/**
 * Renders a {@link WorkspaceContext} (Phase 18) into the readable,
 * multi-line summary that fills a template's `{{workspaceSummary}}`
 * placeholder — this is what makes "AI receives structured workspace
 * context" (Phase 18's acceptance criterion) literally true: the
 * structure isn't lost, just flattened into readable prose for the model.
 */
function summarizeWorkspaceContext(context: WorkspaceContext): string {
  const lines = [
    `Workspace: ${context.workspaceName ?? "(none open)"}`,
    `Files: ${String(context.files.length)} tracked`,
    `Project structure: ${context.projectStructure.length > 0 ? context.projectStructure.join(", ") : "(not available yet)"}`,
    `Selected file: ${context.selectedFile ?? "(none)"}`,
    `Selected function: ${context.selectedFunction ?? "(not available yet)"}`,
    `Open editors: ${context.openEditors.length > 0 ? context.openEditors.join(", ") : "(none)"}`,
    `Recent analysis: ${context.recentAnalysis.length > 0 ? `${String(context.recentAnalysis.length)} entries` : "(not available yet)"}`,
  ];
  return lines.join("\n");
}

/**
 * Builds a {@link PromptContext} from the {@link AIContext} callers
 * currently have available.
 *
 * Per MASTER_05_AI_RULES.md, a full Context Builder always includes
 * Language, File path, AST summary, Imports, Functions, Classes,
 * Dependencies, Complexity summary, Workspace summary, and the User
 * request. `workspaceSummary` and `dependencies` are populated from
 * Phase 18's {@link WorkspaceContext} when the caller supplies one;
 * `astSummary`/`functions`/`classes`/`complexitySummary` are left
 * `undefined` here and render as "(not available yet)" wherever a
 * template references them (see variable-injection.ts) — those need
 * Phase 20's AST Parsing and Phases 23–24's Complexity Engines, neither
 * of which exists yet.
 *
 * This function is the single seam later phases extend, by enriching the
 * object this function returns, not by changing any template or the
 * {@link PromptManager} that calls it.
 */
export function buildPromptContext(context: AIContext): PromptContext {
  return {
    code: context.code,
    ...(context.language !== undefined ? { language: context.language } : {}),
    ...(context.filePath !== undefined ? { filePath: context.filePath } : {}),
    ...(context.userRequest !== undefined ? { userRequest: context.userRequest } : {}),
    ...(context.workspaceContext !== undefined
      ? {
          workspaceSummary: summarizeWorkspaceContext(context.workspaceContext),
          dependencies: context.workspaceContext.dependencies,
        }
      : {}),
  };
}
