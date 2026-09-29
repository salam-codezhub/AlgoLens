import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { PACKAGE_NAME as CORE_PACKAGE_NAME, ok } from "@algolens/core";
import { analyzeSource } from "@algolens/analyzer";
import { measureRuntimeAsync } from "@algolens/runtime";
import type { ServiceResponse } from "@algolens/shared";
import { VsCodeWorkspaceContextService } from "./workspace-context-service.js";
import { detectLanguage } from "@algolens/parser";
import { createDatabase, MemoryService, StorageService } from "@algolens/storage";

export const PACKAGE_NAME = "@algolens/extension" as const;

const SHOW_INFO_COMMAND_ID = "algolens.showInfo";
const SHOW_WORKSPACE_CONTEXT_COMMAND_ID = "algolens.showWorkspaceContext";
const SHOW_DASHBOARD_COMMAND_ID = "algolens.showDashboard";
const ANALYZE_CURRENT_FILE_COMMAND_ID = "algolens.analyzeCurrentFile";
let activeDashboardPanel: vscode.WebviewPanel | undefined;

type WebviewMessage =
  { readonly type: "algolens.ready" } | { readonly type: "algolens.refreshWorkspace" };

type ExtensionMessage =
  | {
      readonly type: "algolens.workspaceContext";
      readonly payload: Awaited<ReturnType<VsCodeWorkspaceContextService["getWorkspaceContext"]>>;
    }
  | {
      readonly type: "algolens.analysisResult";
      readonly payload: Awaited<ReturnType<typeof analyzeSource>>;
    }
  | {
      readonly type: "algolens.analysisHistory";
      readonly payload: readonly {
        readonly analyzedAt: number;
        readonly filePath: string;
        readonly complexity: number;
        readonly runtimeMs: number;
      }[];
    };

export function corePackageDependency(): ServiceResponse<string> {
  return ok(CORE_PACKAGE_NAME);
}

async function analyzeSelectedFile(workspaceContextService: VsCodeWorkspaceContextService): Promise<
  | {
      readonly analysis: Awaited<ReturnType<typeof analyzeSource>>;
      readonly runtimeMs: number;
    }
  | undefined
> {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const code = editor.document.getText();

    const languageResult = detectLanguage({
      vscodeLanguageId: editor.document.languageId,
      filePath: editor.document.uri.fsPath,
      content: code,
    });

    if (languageResult.language === "unknown") {
      return undefined;
    }

    const language = languageResult.language;

    const measured = await measureRuntimeAsync(async () =>
      analyzeSource(code, editor.document.uri.fsPath, language)
    );

    return {
      analysis: await analyzeSource(code, editor.document.uri.fsPath, languageResult.language),
      runtimeMs: measured.report.averageRuntimeMs,
    };
  }

  const workspaceContext = await workspaceContextService.getWorkspaceContext();

  if (!workspaceContext.selectedFile) {
    return undefined;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    return undefined;
  }

  const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, workspaceContext.selectedFile);

  try {
    const document = await vscode.workspace.openTextDocument(fileUri);
    const code = document.getText();

    const languageResult = detectLanguage({
      vscodeLanguageId: document.languageId,
      filePath: document.uri.fsPath,
      content: code,
    });

    if (languageResult.language === "unknown") {
      return undefined;
    }

    const language = languageResult.language;

    const measured = await measureRuntimeAsync(async () =>
      analyzeSource(code, document.uri.fsPath, language)
    );

    return {
      analysis: await analyzeSource(code, document.uri.fsPath, language),
      runtimeMs: measured.report.averageRuntimeMs,
    };
  } catch {
    return undefined;
  }
}

function getAnalysisHistory(storage: StorageService): readonly {
  readonly analyzedAt: number;
  readonly filePath: string;
  readonly complexity: number;
  readonly runtimeMs: number;
}[] {
  return storage
    .list("history")
    .map((record) => {
      try {
        const stored = JSON.parse(record.value) as {
          readonly analysis: Awaited<ReturnType<typeof analyzeSource>>;
          readonly runtimeMs: number;
        };

        return {
          analyzedAt: stored.analysis.analyzedAt,
          filePath: stored.analysis.filePath,
          complexity: stored.analysis.fileCyclomaticComplexity,
          runtimeMs: stored.runtimeMs,
        };
      } catch {
        return undefined;
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
    .sort((left, right) => left.analyzedAt - right.analyzedAt)
    .slice(-20);
}

async function refreshDashboard(
  panel: vscode.WebviewPanel,
  workspaceContextService: VsCodeWorkspaceContextService,
  storage: StorageService
): Promise<void> {
  await sendWorkspaceContext(panel, workspaceContextService);
  const result = await analyzeSelectedFile(workspaceContextService);

  if (result) {
    const analysisMessage: ExtensionMessage = {
      type: "algolens.analysisResult",
      payload: result.analysis,
    };

    await panel.webview.postMessage(analysisMessage);

    storage.save(
      "history",
      `${result.analysis.filePath}:${String(result.analysis.analyzedAt)}`,
      JSON.stringify(result)
    );
  }

  const historyMessage: ExtensionMessage = {
    type: "algolens.analysisHistory",
    payload: getAnalysisHistory(storage),
  };

  await panel.webview.postMessage(historyMessage);
}

async function sendWorkspaceContext(
  panel: vscode.WebviewPanel,
  workspaceContextService: VsCodeWorkspaceContextService
): Promise<void> {
  const workspaceContext = await workspaceContextService.getWorkspaceContext();

  const message: ExtensionMessage = {
    type: "algolens.workspaceContext",
    payload: workspaceContext,
  };

  await panel.webview.postMessage(message);
}

function createDashboardPanel(
  context: vscode.ExtensionContext,
  workspaceContextService: VsCodeWorkspaceContextService,
  storage: StorageService
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "algolensDashboard",
    "AlgoLens",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "webview")],
    }
  );

  activeDashboardPanel = panel;

  const webviewRoot = vscode.Uri.joinPath(context.extensionUri, "webview");
  const indexPath = path.join(webviewRoot.fsPath, "index.html");

  let html = fs.readFileSync(indexPath, "utf8");

  html = html.replace(
    /(src|href)="\.\/assets\/([^"]+)"/g,
    (_match, attribute: string, assetName: string) => {
      const assetUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(webviewRoot, "assets", assetName)
      );

      return `${attribute}="${assetUri.toString()}"`;
    }
  );

  const csp = `
    default-src 'none';
    img-src ${panel.webview.cspSource} data: blob:;
    font-src ${panel.webview.cspSource} data:;
    style-src ${panel.webview.cspSource} 'unsafe-inline';
    script-src ${panel.webview.cspSource};
    connect-src ${panel.webview.cspSource} https:;
  `
    .replace(/\s+/g, " ")
    .trim();

  html = html.replace(
    "<head>",
    `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`
  );

  panel.webview.onDidReceiveMessage(
    async (message: WebviewMessage) => {
      if (message.type === "algolens.ready") {
        await refreshDashboard(panel, workspaceContextService, storage);
      }

      if (message.type === "algolens.refreshWorkspace") {
        await refreshDashboard(panel, workspaceContextService, storage);
      }
    },
    undefined,
    context.subscriptions
  );

  panel.webview.html = html;

  return panel;
}

export function activate(context: vscode.ExtensionContext): void {
  const showInfoCommand = vscode.commands.registerCommand(SHOW_INFO_COMMAND_ID, () => {
    const dependency = corePackageDependency();
    const dependencyName = dependency.data ?? "unknown";

    void vscode.window.showInformationMessage(
      `AlgoLens is active. Entry: ${PACKAGE_NAME}, core dependency: ${dependencyName}.`
    );
  });

  const workspaceContextService = new VsCodeWorkspaceContextService();
  const storageDirectory = context.globalStorageUri.fsPath;
  fs.mkdirSync(storageDirectory, { recursive: true });
  const database = createDatabase({
    databasePath: path.join(storageDirectory, "history.db"),
  });
  const storage = new StorageService(database);
  const memory = new MemoryService(storage);

  const showWorkspaceContextCommand = vscode.commands.registerCommand(
    SHOW_WORKSPACE_CONTEXT_COMMAND_ID,
    async () => {
      const workspaceContext = await workspaceContextService.getWorkspaceContext();

      void vscode.window.showInformationMessage(
        `Workspace: ${workspaceContext.workspaceName ?? "(none open)"} | ${String(workspaceContext.files.length)} files | ${String(workspaceContext.dependencies.length)} dependencies | Selected: ${workspaceContext.selectedFile ?? "(none)"}`
      );
    }
  );

  const showDashboardCommand = vscode.commands.registerCommand(SHOW_DASHBOARD_COMMAND_ID, () => {
    createDashboardPanel(context, workspaceContextService, storage);
  });

  const analyzeCurrentFileCommand = vscode.commands.registerCommand(
    ANALYZE_CURRENT_FILE_COMMAND_ID,
    async () => {
      const result = await analyzeSelectedFile(workspaceContextService);

      if (!result) {
        void vscode.window.showWarningMessage("AlgoLens could not analyze the current file.");
        return;
      }

      storage.save(
        "history",
        `${result.analysis.filePath}:${String(result.analysis.analyzedAt)}`,
        JSON.stringify(result)
      );

      void vscode.window.showInformationMessage(
        `Analysis complete: complexity ${String(result.analysis.fileCyclomaticComplexity)} | runtime ${result.runtimeMs.toFixed(2)} ms`
      );
    }
  );
  const showMemoryCommand = vscode.commands.registerCommand("algolens.showMemory", () => {
    const entries = memory.list();
    const summary =
      entries.length === 0
        ? "AlgoLens Memory is empty."
        : entries.map((entry) => `${entry.key}: ${entry.content}`).join(" | ");
    void vscode.window.showInformationMessage(summary);
  });

  const saveListener = vscode.workspace.onDidSaveTextDocument(() => {
    if (activeDashboardPanel) {
      void refreshDashboard(activeDashboardPanel, workspaceContextService, storage);
    }
  });

  context.subscriptions.push(
    showInfoCommand,
    showWorkspaceContextCommand,
    showDashboardCommand,
    showMemoryCommand,
    analyzeCurrentFileCommand,
    saveListener
  );
}

export function deactivate(): void {
  // VS Code disposes registered subscriptions automatically.
}
