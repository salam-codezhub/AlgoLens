import { describe, expect, it } from "vitest";
import { createMockWorkspaceContextService } from "../src/services/workspace-context-service.js";

describe("createMockWorkspaceContextService", () => {
  it("returns the expected workspace context", async () => {
    const service = createMockWorkspaceContextService();

    await expect(service.getWorkspaceContext()).resolves.toEqual({
      workspaceName: "AlgoLens",
      files: ["src/index.ts", "src/services/order-processor.ts", "package.json"],
      language: "TypeScript",
      imports: [],
      dependencies: ["react", "typescript", "vite"],
      projectStructure: ["src", "apps", "packages", "package.json"],
      selectedFile: "src/services/order-processor.ts",
      selectedFunction: undefined,
      openEditors: ["src/services/order-processor.ts", "src/index.ts"],
      recentAnalysis: [],
    });
  });

  it("returns a Promise from getWorkspaceContext", () => {
    const service = createMockWorkspaceContextService();

    expect(service.getWorkspaceContext()).toBeInstanceOf(Promise);
  });

  it("keeps unavailable context fields empty", async () => {
    const service = createMockWorkspaceContextService();
    const context = await service.getWorkspaceContext();

    expect(context.imports).toEqual([]);
    expect(context.selectedFunction).toBeUndefined();
    expect(context.recentAnalysis).toEqual([]);
  });
});
