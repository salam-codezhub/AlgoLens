import { describe, expect, it } from "vitest";
import { createParser } from "@algolens/parser";
import { computeMaxLoopNestingDepth } from "../src/detectors/nested-loops.js";
import { PYTHON_CONFIG } from "../src/tree-sitter-language-configs.js";

describe("NestedLoopsDetector", () => {
  it("detects nested loop depth", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
for i in items:
    for j in items:
        print(i, j)
`);

    const result = computeMaxLoopNestingDepth(tree.rootNode, PYTHON_CONFIG);

    expect(result).toBe(2);
  });

  it("returns depth one for sequential loops", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
for i in items:
    print(i)

for j in items:
    print(j)
`);

    const result = computeMaxLoopNestingDepth(tree.rootNode, PYTHON_CONFIG);

    expect(result).toBe(1);
  });

  it("returns zero when there are no loops", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
value = 10
print(value)
`);

    const result = computeMaxLoopNestingDepth(tree.rootNode, PYTHON_CONFIG);

    expect(result).toBe(0);
  });
});
