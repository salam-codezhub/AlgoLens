import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser C++", () => {
  it("extracts functions, variables, classes, and loops from C++", async () => {
    const result = await parseSource(
      `#include <iostream>
class Search {
public:
    int find(int n) {
        int result = 0;
        for (int i = 0; i < n; i++) {
            result += i;
        }
        return result;
    }
};`,
      "cpp"
    );

    expect(result.language).toBe("cpp");
    expect(result.functions.length).toBeGreaterThan(0);
    expect(result.variables.length).toBeGreaterThan(0);
    expect(result.classes).toContain("Search");
    expect(result.loopCount).toBeGreaterThan(0);
    expect(result.hasParseErrors).toBe(false);
  });
});
