import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "../src/index.js";

describe("ui public API", () => {
  it("exports the canonical package name", () => {
    expect(PACKAGE_NAME).toBe("@algolens/ui");
  });

  it("loads the UI package successfully", () => {
    expect(PACKAGE_NAME).toBeTruthy();
  });
});
