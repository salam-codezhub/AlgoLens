import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser malformed code", () => {
  it("reports parse errors for malformed Python", async () => {
    const result = await parseSource("def broken(:`n    return 1", "python");

    expect(result.hasParseErrors).toBe(true);
  });
});
