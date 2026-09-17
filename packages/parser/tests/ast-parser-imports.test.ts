import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser imports", () => {
  it("extracts Python import statements", async () => {
    const result = await parseSource(
      `import os
from pathlib import Path
import json`,
      "python"
    );

    expect(result.imports).toContain("os");
    expect(result.imports).toContain("pathlib");
    expect(result.imports).toContain("json");
    expect(result.hasParseErrors).toBe(false);
  });
});
