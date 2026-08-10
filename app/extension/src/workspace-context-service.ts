import * as vscode from "vscode";
import type { WorkspaceContext, WorkspaceContextService } from "@algolens/core";
import { detectDominantLanguage, detectLanguage } from "@algolens/parser";

const MAX_FILES = 500;
const FIND_FILES_INCLUDE = "**/*";
const FIND_FILES_EXCLUDE = "**/node_modules/**";

interface PackageJsonShape {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

async function readDependencies(root: vscode.WorkspaceFolder): Promise<readonly string[]> {
  try {
    const packageJsonUri = vscode.Uri.joinPath(root.uri, "package.json");
    const bytes = await vscode.workspace.fs.readFile(packageJsonUri);
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as PackageJsonShape;
    return [
      ...Object.keys(parsed.dependencies ?? {}),
      ...Object.keys(parsed.devDependencies ?? {}),
    ];
  } catch {
    // No package.json, or it's not valid JSON — not every project has one
    // (or is even Node-based), so this is an expected, non-error case.
    return [];
  }
}

async function readProjectStructure(root: vscode.WorkspaceFolder): Promise<readonly string[]> {
  try {
    const entries = await vscode.workspace.fs.readDirectory(root.uri);
    return entries
      .filter(([name]) => name !== "node_modules" && name !== ".git")
      .map(([name]) => name);
  } catch {
    return [];
  }
}

/**
 * Detects the workspace's language via Phase 19's real detector — the
 * active editor's languageId and content when one is open (strongest
 * signal), falling back to a majority vote over every collected file's
 * extension (`files`) so the field is still meaningful with no editor
 * open at all.
 */
function detectWorkspaceLanguage(files: readonly string[]): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const result = detectLanguage({
      vscodeLanguageId: activeEditor.document.languageId,
      filePath: activeEditor.document.uri.fsPath,
      content: activeEditor.document.getText(),
    });
    if (result.language !== "unknown") {
      return result.language;
    }
  }
  return detectDominantLanguage(files);
}

function getSelectedFile(): string | undefined {
  const uri = vscode.window.activeTextEditor?.document.uri;
  return uri ? vscode.workspace.asRelativePath(uri) : undefined;
}

function getOpenEditors(): readonly string[] {
  const paths = vscode.window.visibleTextEditors.map((editor) =>
    vscode.workspace.asRelativePath(editor.document.uri)
  );
  return [...new Set(paths)];
}

/**
 * Real {@link WorkspaceContextService} backed by the actual VS Code API —
 * this is the only place in the codebase that's allowed to import
 * `vscode` directly and call these methods, per CLAUDE.md's "Extension
 * glue -> apps/extension" folder rule; `packages/core` only knows the
 * interface.
 *
 * `imports` (per-file), `selectedFunction`, and `recentAnalysis` are
 * intentionally left empty/undefined here too — see
 * `WorkspaceContext`'s own doc comment for which future phase populates
 * each. Getting real workspace/file/dependency/editor data now doesn't
 * require guessing at those.
 */
export class VsCodeWorkspaceContextService implements WorkspaceContextService {
  async getWorkspaceContext(): Promise<WorkspaceContext> {
    const root = vscode.workspace.workspaceFolders?.[0];

    if (!root) {
      return {
        workspaceName: undefined,
        files: [],
        language: detectWorkspaceLanguage([]),
        imports: [],
        dependencies: [],
        projectStructure: [],
        selectedFile: getSelectedFile(),
        selectedFunction: undefined,
        openEditors: getOpenEditors(),
        recentAnalysis: [],
      };
    }

    const [fileUris, dependencies, projectStructure] = await Promise.all([
      vscode.workspace.findFiles(FIND_FILES_INCLUDE, FIND_FILES_EXCLUDE, MAX_FILES),
      readDependencies(root),
      readProjectStructure(root),
    ]);
    const files = fileUris.map((uri) => vscode.workspace.asRelativePath(uri));

    return {
      workspaceName: root.name,
      files,
      language: detectWorkspaceLanguage(files),
      imports: [],
      dependencies,
      projectStructure,
      selectedFile: getSelectedFile(),
      selectedFunction: undefined,
      openEditors: getOpenEditors(),
      recentAnalysis: [],
    };
  }
}
