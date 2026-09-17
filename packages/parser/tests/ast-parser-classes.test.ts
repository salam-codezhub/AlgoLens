import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser classes", () => {
  it("extracts multiple Python classes", async () => {
    const result = await parseSource(
      `class Search:
    def find(self):
        return True

class Analyzer:
    def analyze(self):
        return True`,
      "python"
    );

    expect(result.classes).toContain("Search");
    expect(result.classes).toContain("Analyzer");
    expect(result.classes.length).toBeGreaterThanOrEqual(2);
    expect(result.hasParseErrors).toBe(false);
  });
});
