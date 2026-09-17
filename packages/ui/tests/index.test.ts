import { describe, expect, it } from "vitest";
import * as UI from "../src/index.js";

describe("UI package index", () => {
  it("exports the canonical package name", () => {
    expect(UI.PACKAGE_NAME).toBe("@algolens/ui");
  });

  it("exports the utility API", () => {
    expect(UI.cn).toBeDefined();
    expect(typeof UI.cn).toBe("function");
  });

  it("exports the page placeholder API", () => {
    expect(UI.PagePlaceholder).toBeDefined();
    expect(typeof UI.PagePlaceholder).toBe("function");
  });

  it("exports the UI component APIs", () => {
    expect(UI.Button).toBeDefined();
    expect(UI.Card).toBeDefined();
    expect(UI.Dialog).toBeDefined();
    expect(UI.Input).toBeDefined();
    expect(UI.Tabs).toBeDefined();
    expect(UI.Accordion).toBeDefined();
  });
});
