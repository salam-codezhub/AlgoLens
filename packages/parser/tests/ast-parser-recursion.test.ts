import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser recursion", () => {
  it("detects recursive Python functions", async () => {
    const result = await parseSource(
      `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
      "python"
    );

    expect(result.functions).toContain("factorial");
    expect(result.recursiveFunctions).toContain("factorial");
    expect(result.hasParseErrors).toBe(false);
  });
});
