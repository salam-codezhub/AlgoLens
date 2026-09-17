import { describe, expect, it } from "vitest";
import { parseSource } from "../src/ast/ast-parser.js";

describe("AST Parser loops", () => {
  it("counts Python for and while loops", async () => {
    const result = await parseSource(
      `for item in items:
    print(item)

while count > 0:
    count -= 1`,
      "python"
    );

    expect(result.loopCount).toBe(2);
    expect(result.hasParseErrors).toBe(false);
  });
});
