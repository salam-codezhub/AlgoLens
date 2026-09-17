import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser Java", () => {
  it("extracts functions, variables, classes, and loops from Java", async () => {
    const result = await parseSource(
      `class Search {
    int find(int n) {
        int result = 0;
        for (int i = 0; i < n; i++) {
            result += i;
        }
        return result;
    }
}`,
      "java"
    );

    expect(result.language).toBe("java");
    expect(result.functions.length).toBeGreaterThan(0);
    expect(result.variables.length).toBeGreaterThan(0);
    expect(result.classes).toContain("Search");
    expect(result.loopCount).toBeGreaterThan(0);
    expect(result.hasParseErrors).toBe(false);
  });
});
