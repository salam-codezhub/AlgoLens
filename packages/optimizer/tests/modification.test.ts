import { describe, expect, it } from "vitest";
import { ModificationManager } from "../src/modification/modification-manager.js";
import { generatePatch, previewModification } from "../src/modification/patch-preview.js";

describe("modification patch preview", () => {
  it("generates a patch with before and after code", () => {
    const patch = generatePatch("const x = 1;", "const x = 2;");

    expect(patch.before).toBe("const x = 1;");
    expect(patch.after).toBe("const x = 2;");
    expect(patch.unifiedDiff).toContain("-const x = 1;");
    expect(patch.unifiedDiff).toContain("+const x = 2;");
  });

  it("preserves unchanged lines in the diff", () => {
    const patch = generatePatch("line1\nline2", "line1\nchanged");

    expect(patch.unifiedDiff).toContain(" line1");
    expect(patch.unifiedDiff).toContain("-line2");
    expect(patch.unifiedDiff).toContain("+changed");
  });

  it("creates a preview with optional syntax language", () => {
    const preview = previewModification("const x = 1;", "const x = 2;", "typescript");

    expect(preview.status).toBe("preview");
    expect(preview.syntaxLanguage).toBe("typescript");
    expect(preview.patch.after).toBe("const x = 2;");
  });

  it("creates a preview without syntax language", () => {
    const preview = previewModification("a", "b");

    expect(preview.status).toBe("preview");
    expect(preview.syntaxLanguage).toBeUndefined();
  });
});

describe("ModificationManager", () => {
  it("starts with the initial code and empty history", () => {
    const manager = new ModificationManager("original");
    const state = manager.getState();

    expect(state.currentCode).toBe("original");
    expect(state.history).toHaveLength(0);
    expect(state.historyIndex).toBe(-1);
  });

  it("accepts and applies a modification", () => {
    const manager = new ModificationManager("before");
    const preview = previewModification("before", "after");

    const entry = manager.accept(preview);

    expect(entry.status).toBe("accepted");
    expect(manager.getState().history).toHaveLength(1);

    expect(manager.apply(entry.id)).toBe("after");
    expect(manager.getState().history[0]?.status).toBe("applied");
  });

  it("rejects applying an unknown modification", () => {
    const manager = new ModificationManager("before");

    expect(() => manager.apply("missing")).toThrow("Only an accepted modification can be applied.");
  });

  it("rejects applying a patch against changed source", () => {
    const manager = new ModificationManager("before");
    const entry = manager.accept(previewModification("before", "after"));

    manager.apply(entry.id);

    expect(() => manager.apply(entry.id)).toThrow("Only an accepted modification can be applied.");
  });

  it("undoes and redoes accepted modifications", () => {
    const manager = new ModificationManager("before");
    const entry = manager.accept(previewModification("before", "after"));

    expect(manager.undo()).toBe("before");
    expect(manager.redo()).toBe("after");
    expect(manager.getState().historyIndex).toBe(0);
    expect(entry.status).toBe("accepted");
  });

  it("returns current code when undo or redo is unavailable", () => {
    const manager = new ModificationManager("before");

    expect(manager.undo()).toBe("before");
    expect(manager.redo()).toBe("before");
  });

  it("rolls back to the state before a selected history entry", () => {
    const manager = new ModificationManager("v1");

    const first = manager.accept(previewModification("v1", "v2"));
    manager.apply(first.id);

    const second = manager.accept(previewModification("v2", "v3"));
    manager.apply(second.id);

    expect(manager.rollback(second.id)).toBe("v2");
    expect(manager.getState().historyIndex).toBe(0);
  });

  it("rejects rollback of an unknown entry", () => {
    const manager = new ModificationManager("before");

    expect(() => manager.rollback("missing")).toThrow("Modification history entry not found.");
  });
});
