import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { PACKAGE_NAME as CORE_PACKAGE_NAME, ok } from "@algolens/core";
import { analyzeSource } from "@algolens/analyzer";
import { optimizeCode } from "@algolens/optimizer";
import { analyzeSecurity } from "@algolens/security";
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
const ANALYZE_SECURITY_COMMAND_ID = "algolens.analyzeSecurity";
const SUGGEST_OPTIMIZATIONS_COMMAND_ID = "algolens.suggestOptimizations";
const REMEMBER_MEMORY_COMMAND_ID = "algolens.rememberMemory";
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
  storage: StorageService,
  existingResult?: Awaited<ReturnType<typeof analyzeSelectedFile>>
): Promise<void> {
  await sendWorkspaceContext(panel, workspaceContextService);
  const result = existingResult ?? (await analyzeSelectedFile(workspaceContextService));

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

  panel.onDidDispose(() => {
    if (activeDashboardPanel === panel) {
      activeDashboardPanel = undefined;
    }
  });

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

async function showMarkdownReport(content: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument({ language: "markdown", content });
  await vscode.window.showTextDocument(document, { preview: true });
}

function formatSecurityReport(
  fileName: string,
  report: ReturnType<typeof analyzeSecurity>
): string {
  const lines = [
    "# AlgoLens Security Report",
    "",
    `- **File:** \`${fileName}\``,
    `- **Findings:** ${String(report.issueCount)}`,
    `- **Critical:** ${String(report.criticalCount)} | **High:** ${String(report.highCount)} | **Medium:** ${String(report.mediumCount)} | **Low:** ${String(report.lowCount)}`,
    `- **Average finding confidence:** ${String(report.confidence)}%`,
    "",
    "> This heuristic scan can miss vulnerabilities and produce false positives. It is not a substitute for a complete security review.",
    "",
  ];

  if (report.issues.length === 0) {
    lines.push("No issues were detected by the current security rules.");
  } else {
    for (const issue of report.issues) {
      const location = issue.line === undefined ? "" : ` (line ${String(issue.line)})`;
      lines.push(
        `## ${issue.severity.toUpperCase()}: ${issue.type}${location}`,
        "",
        issue.message,
        "",
        `Confidence: ${String(issue.confidence)}%`,
        ""
      );
    }
  }
  return lines.join("\n");
}

function formatOptimizationReport(
  fileName: string,
  report: ReturnType<typeof optimizeCode>
): string {
  const lines = [
    "# AlgoLens Optimization Suggestions",
    "",
    `- **File:** \`${fileName}\``,
    `- **Suggestions:** ${String(report.suggestions.length)}`,
    `- **Overall confidence:** ${String(report.confidence)}%`,
    `- **Overall risk:** ${report.risk}`,
    "",
    report.explanation,
    "",
  ];

  if (report.suggestions.length === 0) {
    lines.push("No optimization opportunities were identified by the current heuristics.", "");
  } else {
    for (const suggestion of report.suggestions) {
      lines.push(
        `## ${suggestion.title}`,
        "",
        `- **Category:** ${suggestion.type}`,
        `- **Risk:** ${suggestion.risk}`,
        `- **Confidence:** ${String(suggestion.confidence)}%`,
        "",
        suggestion.description,
        "",
        `**Why consider this:** ${suggestion.rationale}`,
        ""
      );
    }
  }

  if (report.tradeOffs.length > 0) {
    lines.push("## Trade-offs to review", "");
    for (const tradeOff of report.tradeOffs) lines.push(`- ${tradeOff}`);
    lines.push("");
  }

  lines.push(
    "## Patch status",
    "",
    report.diff.before === report.diff.after
      ? "No code changes were generated. These are advisory suggestions only; the source file was not modified and no proposed patch is available to diff."
      : "A candidate change is available for review. The source file has not been modified.",
    ""
  );
  return lines.join("\n");
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
    if (activeDashboardPanel) {
      activeDashboardPanel.reveal(vscode.ViewColumn.One);
      return;
    }

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

      if (activeDashboardPanel) {
        await refreshDashboard(activeDashboardPanel, workspaceContextService, storage, result);
      }

      void vscode.window.showInformationMessage(
        `Analysis complete: complexity ${String(result.analysis.fileCyclomaticComplexity)} | runtime ${result.runtimeMs.toFixed(2)} ms`
      );
    }
  );
  const analyzeSecurityCommand = vscode.commands.registerCommand(
    ANALYZE_SECURITY_COMMAND_ID,
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showWarningMessage(
          "Open a source file before running AlgoLens security analysis."
        );
        return;
      }
      const report = analyzeSecurity(editor.document.getText());
      const fileName = path.basename(editor.document.uri.fsPath) || editor.document.uri.toString();
      await showMarkdownReport(formatSecurityReport(fileName, report));
    }
  );

  const suggestOptimizationsCommand = vscode.commands.registerCommand(
    SUGGEST_OPTIMIZATIONS_COMMAND_ID,
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showWarningMessage(
          "Open a source file before requesting AlgoLens optimization suggestions."
        );
        return;
      }
      const report = optimizeCode(editor.document.getText());
      const fileName = path.basename(editor.document.uri.fsPath) || editor.document.uri.toString();

      if (report.diff.before !== report.diff.after) {
        const candidate = await vscode.workspace.openTextDocument({
          language: editor.document.languageId,
          content: report.optimizedCode,
        });
        await vscode.commands.executeCommand(
          "vscode.diff",
          editor.document.uri,
          candidate.uri,
          `Review AlgoLens optimization: ${fileName}`
        );
        return;
      }
      await showMarkdownReport(formatOptimizationReport(fileName, report));
    }
  );

  const rememberMemoryCommand = vscode.commands.registerCommand(
    REMEMBER_MEMORY_COMMAND_ID,
    async () => {
      const key = await vscode.window.showInputBox({
        prompt: "Memory key",
        placeHolder: "e.g. preferred-language",
        validateInput: (value) => (value.trim() ? undefined : "Memory key is required."),
      });

      if (!key) {
        return;
      }

      const content = await vscode.window.showInputBox({
        prompt: "Memory content",
        placeHolder: "e.g. Prefer TypeScript for new code",
        validateInput: (value) => (value.trim() ? undefined : "Memory content is required."),
      });

      if (!content) {
        return;
      }

      memory.remember(key.trim(), content.trim());
      void vscode.window.showInformationMessage(`AlgoLens memory saved: ${key.trim()}`);
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
    rememberMemoryCommand,
    analyzeCurrentFileCommand,
    analyzeSecurityCommand,
    suggestOptimizationsCommand,
    saveListener
  );
}

export function deactivate(): void {
  // VS Code disposes registered subscriptions automatically.
}
