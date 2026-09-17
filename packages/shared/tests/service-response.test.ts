import { describe, expect, it } from "vitest";
import { fail, ok } from "../src/types/service-response.js";

describe("service response", () => {
  it("creates a successful response with data", () => {
    const response = ok({ value: 42 });

    expect(response).toEqual({
      success: true,
      data: { value: 42 },
    });
  });

  it("includes metadata and execution time when provided", () => {
    const response = ok("result", { source: "test" }, 125);

    expect(response.success).toBe(true);
    expect(response.data).toBe("result");
    expect(response.metadata).toEqual({ source: "test" });
    expect(response.executionTime).toBe(125);
  });

  it("omits optional fields when they are undefined", () => {
    const response = ok("result");

    expect(response).not.toHaveProperty("metadata");
    expect(response).not.toHaveProperty("executionTime");
  });

  it("creates a failed response", () => {
    const error = {
      code: "TEST_ERROR",
      message: "Something went wrong",
      recoverable: true,
    };

    const response = fail(error);

    expect(response.success).toBe(false);
    expect(response.error).toEqual(error);
    expect(response.data).toBeUndefined();
  });

  it("preserves an optional error cause", () => {
    const response = fail({
      code: "PARSE_ERROR",
      message: "Unable to parse source",
      cause: "Malformed syntax",
      recoverable: false,
    });

    expect(response.error?.cause).toBe("Malformed syntax");
    expect(response.error?.recoverable).toBe(false);
  });
});
