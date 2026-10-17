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
import {
  AI_PROVIDER_SECRET_PREFIX,
  presentExplainOutcome,
  runExplainCommand,
} from "./code-explainer.js";

export const PACKAGE_NAME = "@algolens/extension" as const;

const SHOW_INFO_COMMAND_ID = "algolens.showInfo";
const SHOW_WORKSPACE_CONTEXT_COMMAND_ID = "algolens.showWorkspaceContext";
const SHOW_DASHBOARD_COMMAND_ID = "algolens.showDashboard";
const ANALYZE_CURRENT_FILE_COMMAND_ID = "algolens.analyzeCurrentFile";
const ANALYZE_SECURITY_COMMAND_ID = "algolens.analyzeSecurity";
const SUGGEST_OPTIMIZATIONS_COMMAND_ID = "algolens.suggestOptimizations";
const EXPLAIN_CODE_COMMAND_ID = "algolens.explainCode";
const RESET_SOURCE_DISCLOSURE_CONSENT_COMMAND_ID = "algolens.resetSourceDisclosureConsent";
const REMEMBER_MEMORY_COMMAND_ID = "algolens.rememberMemory";
let activeDashboardPanel: vscode.WebviewPanel | undefined;
let latestSecurityReport: ReturnType<typeof analyzeSecurity> | undefined;

type WebviewMessage =
  { readonly type: "algolens.ready" } | { readonly type: "algolens.refreshWorkspace" };

type ExtensionMessage =
  | {
      readonly type: "algolens.securityReport";
      readonly payload: ReturnType<typeof analyzeSecurity>;
    }
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

async function sendLatestSecurityReport(panel: vscode.WebviewPanel): Promise<void> {
  if (!latestSecurityReport) return;
  const message: ExtensionMessage = {
    type: "algolens.securityReport",
    payload: latestSecurityReport,
  };
  await panel.webview.postMessage(message);
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
        await sendLatestSecurityReport(panel);
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

async function explainCodeCommand(context: vscode.ExtensionContext): Promise<void> {
  const controller = new AbortController();
  const outcome = await runExplainCommand({
    signal: controller.signal,
    getEditor: () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return undefined;
      return {
        selection: editor.document.getText(editor.selection),
        documentText: editor.document.getText(),
        language: editor.document.languageId,
        filePath: editor.document.uri.fsPath,
      };
    },
    getProviderSetting: () =>
      vscode.workspace.getConfiguration("algolens.ai").get<unknown>("provider", "openai"),
    getModelSetting: () => vscode.workspace.getConfiguration("algolens.ai").get<string>("model"),
    getApiKey: async (provider) =>
      await context.secrets.get(`${AI_PROVIDER_SECRET_PREFIX}${provider}`),
    requestApiKey: async (provider) => {
      const choice = await vscode.window.showWarningMessage(
        `No API key is saved for ${provider}. Save a key securely to continue.`,
        "Save API Key"
      );
      if (choice !== "Save API Key") return undefined;
      return vscode.window.showInputBox({
        prompt: `API key for ${provider}`,
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => (value.trim() ? undefined : "API key is required."),
      });
    },
    storeApiKey: async (provider, key) => {
      await context.secrets.store(`${AI_PROVIDER_SECRET_PREFIX}${provider}`, key);
    },
    confirmRemoteDisclosure: async (provider, filePath) => {
      const consentKey = "algolens.ai.sourceDisclosureAccepted";
      if (context.workspaceState.get<boolean>(consentKey, false)) return true;
      const choice = await vscode.window.showWarningMessage(
        `AlgoLens will send source code and the file path "${filePath}" to the remote ${provider} AI provider for explanation. Only continue if you are allowed to share this code with that provider.`,
        { modal: true },
        "Send Code and Continue"
      );
      if (choice !== "Send Code and Continue") return false;
      await context.workspaceState.update(consentKey, true);
      return true;
    },
    resolveInput: (editor, code) => {
      const languageResult = detectLanguage({
        vscodeLanguageId: editor.language,
        filePath: editor.filePath,
        content: code,
      });
      const language =
        languageResult.language === "unknown" ? editor.language : languageResult.language;
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      const filePath = workspaceFolder
        ? path.relative(workspaceFolder.uri.fsPath, editor.filePath).replace(/\\/g, "/")
        : editor.filePath.replace(/\\/g, "/");
      return { language, filePath };
    },
    explain: async (config, input) =>
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "AlgoLens is explaining code with AI...",
          cancellable: true,
        },
        async (_progress, token) => {
          const cancellationListener = token.onCancellationRequested(() => {
            controller.abort();
          });
          try {
            const { explainWithProvider } = await import("./code-explainer.js");
            return await explainWithProvider(config, input);
          } finally {
            cancellationListener.dispose();
          }
        }
      ),
  });
  const finalOutcome = controller.signal.aborted ? { kind: "cancelled" as const } : outcome;

  await presentExplainOutcome(finalOutcome, {
    showWarning: (message) => {
      void vscode.window.showWarningMessage(message);
    },
    showError: (message) => {
      void vscode.window.showErrorMessage(message);
    },
    showReport: async (content) => {
      await showMarkdownReport(content);
    },
  });
}
export function activate(context: vscode.ExtensionContext): void {
  const resetSourceDisclosureConsentCommand = vscode.commands.registerCommand(
    RESET_SOURCE_DISCLOSURE_CONSENT_COMMAND_ID,
    async () => {
      const choice = await vscode.window.showWarningMessage(
        "Reset the source-sharing consent for this workspace? The next AI code explanation will ask for confirmation again.",
        { modal: true },
        "Reset Consent"
      );
      if (choice !== "Reset Consent") return;
      await context.workspaceState.update("algolens.ai.sourceDisclosureAccepted", undefined);
      void vscode.window.showInformationMessage(
        "AlgoLens source-sharing consent was reset for this workspace."
      );
    }
  );
  const explainCodeCommandDisposable = vscode.commands.registerCommand(
    EXPLAIN_CODE_COMMAND_ID,
    () => explainCodeCommand(context)
  );
  const showInfoCommand = vscode.commands.registerCommand(SHOW_INFO_COMMAND_ID, () => {
    const dependency = corePackageDependency();
    const dependencyName = dependency.data ?? "unknown";

    void vscode.window.showInformationMessage(
      `AlgoLens is active. Entry: ${PACKAGE_NAME}, core dependency: ${dependencyName}.`
    );
  });

  const workspaceContextService = new VsCodeWorkspaceContextService();
  let storage: StorageService | undefined;
  let memory: MemoryService | undefined;

  try {
    const storageDirectory = context.globalStorageUri.fsPath;
    fs.mkdirSync(storageDirectory, { recursive: true });
    const database = createDatabase({
      databasePath: path.join(storageDirectory, "history.db"),
    });
    storage = new StorageService(database);
    memory = new MemoryService(storage);
    context.subscriptions.push({ dispose: () => storage?.close() });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error("[AlgoLens] Persistent SQLite storage failed to initialize:", error);
    void vscode.window.showWarningMessage(
      `AlgoLens started with persistent history and memory unavailable. SQLite initialization failed: ${details}`
    );
  }
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

    if (!storage) {
      void vscode.window.showWarningMessage("AlgoLens dashboard requires working SQLite storage.");
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

      storage?.save(
        "history",
        `${result.analysis.filePath}:${String(result.analysis.analyzedAt)}`,
        JSON.stringify(result)
      );

      if (activeDashboardPanel && storage) {
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
      latestSecurityReport = report;
      if (activeDashboardPanel) await sendLatestSecurityReport(activeDashboardPanel);
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

      if (!memory) {
        void vscode.window.showWarningMessage(
          "AlgoLens memory is unavailable because SQLite storage failed to initialize."
        );
        return;
      }
      memory.remember(key.trim(), content.trim());
      void vscode.window.showInformationMessage(`AlgoLens memory saved: ${key.trim()}`);
    }
  );

  const showMemoryCommand = vscode.commands.registerCommand("algolens.showMemory", () => {
    if (!memory) {
      void vscode.window.showWarningMessage(
        "AlgoLens memory is unavailable because SQLite storage failed to initialize."
      );
      return;
    }
    const entries = memory.list();
    const summary =
      entries.length === 0
        ? "AlgoLens Memory is empty."
        : entries.map((entry) => `${entry.key}: ${entry.content}`).join(" | ");
    void vscode.window.showInformationMessage(summary);
  });

  const saveListener = vscode.workspace.onDidSaveTextDocument(() => {
    if (activeDashboardPanel && storage) {
      void refreshDashboard(activeDashboardPanel, workspaceContextService, storage);
    }
  });

  context.subscriptions.push(
    explainCodeCommandDisposable,
    resetSourceDisclosureConsentCommand,
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
