import { describe, expect, it } from "vitest";
import { createParser } from "@algolens/parser";
import { detectUnusedSymbols } from "../src/detectors/unused-symbols.js";
import { PYTHON_CONFIG } from "../src/tree-sitter-language-configs.js";

describe("UnusedSymbolsDetector", () => {
  it("detects a declared symbol that appears only once", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
unused_value = 10
used_value = 20
print(used_value)
`);

    const result = detectUnusedSymbols(tree.rootNode, PYTHON_CONFIG, [
      "unused_value",
      "used_value",
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("unused_value");
    expect(result[0]?.confidence).toBe(70);
  });

  it("does not flag a symbol that is used", async () => {
    const parser = await createParser("python");
    const tree = parser.parse(`
value = 10
print(value)
`);

    const result = detectUnusedSymbols(tree.rootNode, PYTHON_CONFIG, ["value"]);

    expect(result).toHaveLength(0);
  });
});
