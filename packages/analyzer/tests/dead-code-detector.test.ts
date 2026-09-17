import { describe, expect, it } from "vitest";
import { createParser } from "@algolens/parser";
import { detectDeadCode } from "../src/detectors/dead-code.js";
import { PYTHON_CONFIG } from "../src/tree-sitter-language-configs.js";

describe("DeadCodeDetector", () => {
  it("detects unreachable code after return", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
def test():
    return 1
    print("unreachable")
`);

    const result = detectDeadCode(tree.rootNode, PYTHON_CONFIG);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.afterStatementType).toBe("return_statement");
  });

  it("does not flag normal sequential code", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
def test():
    value = 1
    return value
`);

    const result = detectDeadCode(tree.rootNode, PYTHON_CONFIG);

    expect(result.length).toBe(0);
  });
});
