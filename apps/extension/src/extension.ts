import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { PACKAGE_NAME as CORE_PACKAGE_NAME, ok } from "@algolens/core";
import { analyzeSource } from "@algolens/analyzer";
import type { ServiceResponse } from "@algolens/shared";
import { VsCodeWorkspaceContextService } from "./workspace-context-service.js";
import { detectLanguage } from "@algolens/parser";

export const PACKAGE_NAME = "@algolens/extension" as const;

const SHOW_INFO_COMMAND_ID = "algolens.showInfo";
const SHOW_WORKSPACE_CONTEXT_COMMAND_ID = "algolens.showWorkspaceContext";
const SHOW_DASHBOARD_COMMAND_ID = "algolens.showDashboard";

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
    };
export function corePackageDependency(): ServiceResponse<string> {
  return ok(CORE_PACKAGE_NAME);
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

async function analyzeSelectedFile(
  workspaceContextService: VsCodeWorkspaceContextService
): Promise<Awaited<ReturnType<typeof analyzeSource>> | undefined> {
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

    return analyzeSource(code, editor.document.uri.fsPath, languageResult.language);
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

    return await analyzeSource(code, document.uri.fsPath, languageResult.language);
  } catch {
    return undefined;
  }
}

function createDashboardPanel(
  context: vscode.ExtensionContext,
  workspaceContextService: VsCodeWorkspaceContextService
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
        await sendWorkspaceContext(panel, workspaceContextService);
        const analysisResult = await analyzeSelectedFile(workspaceContextService);

        if (analysisResult) {
          const analysisMessage: ExtensionMessage = {
            type: "algolens.analysisResult",
            payload: analysisResult,
          };

          await panel.webview.postMessage(analysisMessage);
        }
      }

      if (message.type === "algolens.refreshWorkspace") {
        await sendWorkspaceContext(panel, workspaceContextService);
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
    createDashboardPanel(context, workspaceContextService);
  });

  context.subscriptions.push(showInfoCommand, showWorkspaceContextCommand, showDashboardCommand);
}

export function deactivate(): void {
  // VS Code disposes registered subscriptions automatically.
}
