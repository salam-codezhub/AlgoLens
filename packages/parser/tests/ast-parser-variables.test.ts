import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser variables", () => {
  it("extracts multiple Python variables", async () => {
    const result = await parseSource(
      `count = 10
name = "AlgoLens"
items = [1, 2, 3]`,
      "python"
    );

    expect(result.variables).toContain("count");
    expect(result.variables).toContain("name");
    expect(result.variables).toContain("items");
    expect(result.hasParseErrors).toBe(false);
  });
});
