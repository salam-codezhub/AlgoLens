import { describe, expect, it } from "vitest";
import { analyzeSecurity } from "../src/index.js";

describe("SecurityEngine", () => {
  it("detects SQL injection risk from interpolated queries", () => {
    const result = analyzeSecurity("query(`SELECT * FROM users WHERE id = ${userId}`);");

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(true);
  });
});
