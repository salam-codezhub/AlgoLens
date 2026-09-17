import { describe, expect, it } from "vitest";
import { detectLanguage } from "../src/language/language-detector.js";

describe("LanguageDetector", () => {
  it("detects TypeScript from a file extension", () => {
    const result = detectLanguage({ filePath: "example.ts" });

    expect(result.language).toBe("typescript");
    expect(result.confidence).toBe(90);
    expect(result.method).toBe("extension");
  });

  it("prefers VS Code languageId over the file extension", () => {
    const result = detectLanguage({
      filePath: "example.js",
      vscodeLanguageId: "typescript",
    });

    expect(result.language).toBe("typescript");
    expect(result.confidence).toBe(95);
    expect(result.method).toBe("vscodeLanguageId");
  });

  it("detects Python from a shebang when no extension signal exists", () => {
    const result = detectLanguage({
      filePath: "script",
      content: "#!/usr/bin/env python3`r`nprint('hello')",
    });

    expect(result.language).toBe("python");
    expect(result.confidence).toBe(85);
    expect(result.method).toBe("shebang");
  });

  it("returns unknown when no language signal is available", () => {
    const result = detectLanguage({ filePath: "example.unknown" });

    expect(result.language).toBe("unknown");
    expect(result.confidence).toBe(0);
    expect(result.method).toBe("unknown");
  });
});
