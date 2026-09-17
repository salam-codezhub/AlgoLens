import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "../src/index.js";

describe("shared public API", () => {
  it("exports the canonical package name", () => {
    expect(PACKAGE_NAME).toBe("@algolens/shared");
  });

  it("loads the shared package successfully", () => {
    expect(PACKAGE_NAME).toBeTruthy();
  });
});
