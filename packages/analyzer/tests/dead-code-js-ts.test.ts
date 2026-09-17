import { describe, expect, it } from "vitest";
import { parse } from "@babel/parser";
import { detectDeadCodeJsTs } from "../src/detectors/dead-code-js-ts.js";

describe("DeadCodeJsTsDetector", () => {
  it("detects unreachable code after return", () => {
    const ast = parse(
      `
function test() {
  return 1;
  console.log("unreachable");
}
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    const result = detectDeadCodeJsTs(ast);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.afterStatementType).toBe("ReturnStatement");
    expect(result[0]?.unreachableStatementCount).toBe(1);
  });

  it("does not flag normal sequential code", () => {
    const ast = parse(
      `
function test() {
  const value = 1;
  return value;
}
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    const result = detectDeadCodeJsTs(ast);

    expect(result).toHaveLength(0);
  });
});
