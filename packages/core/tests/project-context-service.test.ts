import { describe, expect, it } from "vitest";
import { createMockProjectContextService } from "../src/services/project-context-service.js";

describe("createMockProjectContextService", () => {
  it("returns the expected project context", () => {
    const service = createMockProjectContextService();

    expect(service.getProjectContext()).toEqual({
      projectName: "AlgoLens",
      currentFile: "src/services/order-processor.ts",
      language: "TypeScript",
      scanStatus: "complete",
    });
  });

  it("returns a consistent context across calls", () => {
    const service = createMockProjectContextService();

    expect(service.getProjectContext()).toEqual(service.getProjectContext());
  });

  it("returns a valid scan status", () => {
    const service = createMockProjectContextService();
    const context = service.getProjectContext();

    expect(["idle", "scanning", "complete", "error"]).toContain(context.scanStatus);
  });
});
