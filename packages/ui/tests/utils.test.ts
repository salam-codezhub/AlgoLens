import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/utils.js";

describe("cn utility", () => {
  it("merges basic class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional class values", () => {
    const condition = Math.random() > 0.5;
    const result = cn("base", condition ? "active" : undefined);

    expect(result).toContain("base");
    if (condition) {
      expect(result).toContain("active");
    }
  });

  it("resolves conflicting Tailwind classes in favor of the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges multiple inputs with custom classes", () => {
    expect(cn("px-2", "py-1", "text-sm", undefined, null, "custom")).toBe(
      "px-2 py-1 text-sm custom"
    );
  });
});
