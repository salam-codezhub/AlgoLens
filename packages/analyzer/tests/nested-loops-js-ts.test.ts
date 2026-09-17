import { describe, expect, it } from "vitest";
import { parse } from "@babel/parser";
import { computeMaxLoopNestingDepthJsTs } from "../src/detectors/nested-loops-js-ts.js";

describe("NestedLoopsJsTsDetector", () => {
  it("detects nested loop depth", () => {
    const ast = parse(
      `
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    console.log(i, j);
  }
}
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    const result = computeMaxLoopNestingDepthJsTs(ast);

    expect(result).toBe(2);
  });

  it("returns depth one for sequential loops", () => {
    const ast = parse(
      `
for (let i = 0; i < 10; i++) {
  console.log(i);
}

for (let j = 0; j < 10; j++) {
  console.log(j);
}
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    const result = computeMaxLoopNestingDepthJsTs(ast);

    expect(result).toBe(1);
  });

  it("returns zero when there are no loops", () => {
    const ast = parse(
      `
const value = 10;
console.log(value);
`,
      {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      }
    );

    const result = computeMaxLoopNestingDepthJsTs(ast);

    expect(result).toBe(0);
  });
});
