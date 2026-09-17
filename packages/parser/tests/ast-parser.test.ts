import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser", () => {
  it("extracts JavaScript structure from source code", async () => {
    const result = await parseSource(
      "import fs from 'fs'; const items = [1, 2]; class Search { find() { for (const item of items) { console.log(item); } } }",
      "javascript"
    );

    expect(result.language).toBe("javascript");
    expect(result.imports.length).toBeGreaterThan(0);
    expect(result.classes).toContain("Search");
    expect(result.variables).toContain("items");
    expect(result.loopCount).toBeGreaterThan(0);
    expect(result.tokenCount).toBeGreaterThan(0);
    expect(result.hasParseErrors).toBe(false);
  });
});
