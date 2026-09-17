import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser Python", () => {
  it("extracts functions, variables, and loops from Python", async () => {
    const result = await parseSource(
      `def search(items):
    for item in items:
        print(item)
items = [1, 2, 3]`,
      "python"
    );

    expect(result.language).toBe("python");
    expect(result.functions.length).toBeGreaterThan(0);
    expect(result.variables.length).toBeGreaterThan(0);
    expect(result.loopCount).toBeGreaterThan(0);
    expect(result.hasParseErrors).toBe(false);
  });
});
