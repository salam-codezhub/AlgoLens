import { describe, expect, it } from "vitest";
import { createParser } from "@algolens/parser";
import { computeCyclomaticComplexity } from "../src/complexity/tree-sitter-cyclomatic.js";
import { PYTHON_CONFIG } from "../src/tree-sitter-language-configs.js";

describe("Tree-sitter Cyclomatic Complexity", () => {
  it("counts baseline plus decisions and loops", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
def search(items):
    for item in items:
        if item > 0:
            print(item)
`);

    const complexity = computeCyclomaticComplexity(tree.rootNode, PYTHON_CONFIG);

    expect(complexity).toBe(3);
  });
});
