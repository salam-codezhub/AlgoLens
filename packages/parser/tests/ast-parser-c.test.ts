import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser C", () => {
  it("extracts functions, variables, and loops from C", async () => {
    const result = await parseSource(
      `#include <stdio.h>
int main() {
    int total = 0;
    for (int i = 0; i < 10; i++) {
        total += i;
    }
    return total;
}`,
      "c"
    );

    expect(result.language).toBe("c");
    expect(result.functions.length).toBeGreaterThan(0);
    expect(result.variables.length).toBeGreaterThan(0);
    expect(result.loopCount).toBeGreaterThan(0);
    expect(result.hasParseErrors).toBe(false);
  });
});
