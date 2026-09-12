import * as vscode from "vscode";
import { PACKAGE_NAME as CORE_PACKAGE_NAME, ok } from "@algolens/core";
import type { ServiceResponse } from "@algolens/shared";
import { VsCodeWorkspaceContextService } from "./workspace-context-service.js";

/** Canonical package name, useful for logging and diagnostics. */
export const PACKAGE_NAME = "@algolens/extension" as const;

/**
 * Command ID for the "AlgoLens: Show Extension Info" command, registered
 * in {@link activate} and declared in package.json's `contributes.commands`.
 */
const SHOW_INFO_COMMAND_ID = "algolens.showInfo";

/**
 * Command ID for the "AlgoLens: Show Workspace Context" command (Phase 18),
 * registered in {@link activate} and declared in package.json's
 * `contributes.commands`.
 */
const SHOW_WORKSPACE_CONTEXT_COMMAND_ID = "algolens.showWorkspaceContext";

/**
 * Confirms this extension can see and use {@link CORE_PACKAGE_NAME} and the
 * {@link ServiceResponse} contract from `@algolens/core` / `@algolens/shared`,
 * proving the webpack build's workspace dependency resolution works
 * end-to-end inside the actual extension bundle.
 */
export function corePackageDependency(): ServiceResponse<string> {
  return ok(CORE_PACKAGE_NAME);
}

/**
 * Called once by VS Code when the extension activates (per the
 * `activationEvents` inferred from `contributes.commands` in package.json).
 * Registers all commands and returns disposables via the extension context
 * so VS Code can clean them up automatically on deactivation.
 */
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
      const context = await workspaceContextService.getWorkspaceContext();
      void vscode.window.showInformationMessage(
        `Workspace: ${context.workspaceName ?? "(none open)"} | ${String(context.files.length)} files | ${String(context.dependencies.length)} dependencies | Selected: ${context.selectedFile ?? "(none)"}`
      );
    }
  );

  context.subscriptions.push(showInfoCommand, showWorkspaceContextCommand);
}

/**
 * Called once by VS Code when the extension deactivates. VS Code already
 * disposes everything pushed to `context.subscriptions` in {@link activate},
 * so there is nothing additional to clean up yet. Present as an explicit,
 * named export because VS Code's extension host looks for it by name and
 * because later phases (background workers, open file handles, DB
 * connections) will have real teardown logic to put here.
 */
export function deactivate(): void {
  // Intentionally empty: context.subscriptions handles disposal for now.
}
