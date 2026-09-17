import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser functions", () => {
  it("extracts multiple Python functions", async () => {
    const result = await parseSource(
      `def add(a, b):
    return a + b

def multiply(a, b):
    return a * b`,
      "python"
    );

    expect(result.functions).toContain("add");
    expect(result.functions).toContain("multiply");
    expect(result.functions.length).toBeGreaterThanOrEqual(2);
    expect(result.hasParseErrors).toBe(false);
  });
});
