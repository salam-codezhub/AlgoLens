import { describe, expect, it } from "vitest";
import { parse } from "@babel/parser";
import { collectTokenTexts } from "../src/complexity/babel-halstead.js";

describe("Babel Halstead token collector", () => {
  it("collects source text from Babel tokens", () => {
    const code = "const total = value + 1;";
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      tokens: true,
    });

    const tokens = collectTokenTexts(ast, code);

    expect(tokens).toContain("const");
    expect(tokens).toContain("total");
    expect(tokens).toContain("=");
    expect(tokens).toContain("value");
    expect(tokens).toContain("+");
    expect(tokens).toContain("1");
  });

  it("returns an empty list when no tokens are available", () => {
    const ast = parse("", {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    const tokens = collectTokenTexts(ast, "");

    expect(tokens).toEqual([]);
  });
});
