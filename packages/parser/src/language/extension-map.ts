import type { SupportedLanguage } from "./types.js";

/**
 * File extension -> language, for every extension in real, common use for
 * the six supported languages. Extensions are matched case-insensitively
 * and without the leading dot.
 */
export const EXTENSION_TO_LANGUAGE: ReadonlyMap<string, SupportedLanguage> = new Map([
  ["c", "c"],
  ["h", "c"],

  ["cpp", "cpp"],
  ["cc", "cpp"],
  ["cxx", "cpp"],
  ["c++", "cpp"],
  ["hpp", "cpp"],
  ["hh", "cpp"],
  ["hxx", "cpp"],

  ["java", "java"],

  ["py", "python"],
  ["pyw", "python"],
  ["pyi", "python"],

  ["js", "javascript"],
  ["jsx", "javascript"],
  ["mjs", "javascript"],
  ["cjs", "javascript"],

  ["ts", "typescript"],
  ["tsx", "typescript"],
  ["mts", "typescript"],
  ["cts", "typescript"],
]);

/** VS Code's own `languageId` strings, mapped the same way. VS Code uses
 *  distinct ids for JSX/TSX ("javascriptreact"/"typescriptreact") that
 *  still map to the same underlying supported language here. */
export const VSCODE_LANGUAGE_ID_MAP: ReadonlyMap<string, SupportedLanguage> = new Map([
  ["c", "c"],
  ["cpp", "cpp"],
  ["java", "java"],
  ["python", "python"],
  ["javascript", "javascript"],
  ["javascriptreact", "javascript"],
  ["typescript", "typescript"],
  ["typescriptreact", "typescript"],
]);

export function extensionFromPath(filePath: string): string | undefined {
  const match = /\.([a-zA-Z0-9+]+)$/.exec(filePath);
  return match ? match[1]?.toLowerCase() : undefined;
}
