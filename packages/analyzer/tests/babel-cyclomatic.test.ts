import { describe, expect, it } from "vitest";
import { parse } from "@babel/parser";
import { getBabelTraverse } from "@algolens/parser";
import { computeCyclomaticComplexityJsTs } from "../src/complexity/babel-cyclomatic.js";

const traverse = getBabelTraverse();

describe("Babel Cyclomatic Complexity", () => {
  it("counts decisions and short-circuit operators", () => {
    const ast = parse(
      `
function search(items, target) {
  for (const item of items) {
    if (item > 0 && item === target) {
      return item;
    }
  }
  return -1;
}
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    let complexity = 0;

    traverse(ast, {
      FunctionDeclaration(path) {
        complexity = computeCyclomaticComplexityJsTs(path);
        path.stop();
      },
    });

    expect(complexity).toBe(4);
  });

  it("returns baseline complexity for a function without decisions", () => {
    const ast = parse(
      `
function test(value) {
  return value;
}
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    let complexity = 0;

    traverse(ast, {
      FunctionDeclaration(path) {
        complexity = computeCyclomaticComplexityJsTs(path);
        path.stop();
      },
    });

    expect(complexity).toBe(1);
  });
});
