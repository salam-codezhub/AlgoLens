import { describe, expect, it } from "vitest";
import { createParser } from "@algolens/parser";
import { collectLeafTokenTexts } from "../src/complexity/tree-sitter-halstead.js";

describe("Tree-sitter Halstead token collector", () => {
  it("collects non-empty leaf token text", async () => {
    const parser = await createParser("python");
    const tree = parser.parse("total = value + 1");

    const tokens = collectLeafTokenTexts(tree.rootNode);

    expect(tokens).toContain("total");
    expect(tokens).toContain("=");
    expect(tokens).toContain("value");
    expect(tokens).toContain("+");
    expect(tokens).toContain("1");
  });

  it("returns an empty list for an empty source tree", async () => {
    const parser = await createParser("python");
    const tree = parser.parse("");

    const tokens = collectLeafTokenTexts(tree.rootNode);

    expect(tokens).toEqual([]);
  });
});
