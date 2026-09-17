import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "../src/index.js";

describe("runtime package", () => {
  it("exports the canonical package name", () => {
    expect(PACKAGE_NAME).toBe("@algolens/runtime");
  });
});
