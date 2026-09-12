import type { SupportedLanguage } from "../language/types.js";
import { extractJsTsSummary } from "./extractors/babel-extractor.js";
import { extractCSummary } from "./extractors/c-extractor.js";
import { extractCppSummary } from "./extractors/cpp-extractor.js";
import { extractJavaSummary } from "./extractors/java-extractor.js";
import { extractPythonSummary } from "./extractors/python-extractor.js";
import { createParser } from "./tree-sitter-runtime.js";
import type { AstSummary, TreeSitterNode } from "./types.js";

export class UnsupportedLanguageError extends Error {
  constructor(language: string) {
    super(`AST parsing is not supported for language "${language}".`);
    this.name = "UnsupportedLanguageError";
  }
}

/** Rough token estimate for the four tree-sitter-backed languages — a full
 *  token stream isn't exposed by web-tree-sitter's public API the way
 *  Babel exposes `ast.tokens`, so this counts leaf (no-child) nodes as a
 *  reasonable proxy, consistent with how a token stream relates to a
 *  parse tree. */
function estimateTokenCount(root: TreeSitterNode): number {
  let count = 0;
  function visit(node: TreeSitterNode): void {
    if (node.childCount === 0) {
      count++;
      return;
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        visit(child);
      }
    }
  }
  visit(root);
  return count;
}

/**
 * Parses `code` and returns a structural {@link AstSummary} — the actual
 * Phase 20 deliverables (AST, Tokens, Imports, Functions, Classes,
 * Variables, Loops, Recursion). Dispatches per language, per Phase 20's
 * "Use" list: Babel for JavaScript/TypeScript, tree-sitter for C/C++/Java,
 * and tree-sitter's Python grammar for Python — no well-maintained,
 * widely-used pure-JS equivalent of Python's own `ast` module exists, and
 * shelling out to a system `python3` isn't guaranteed available in the
 * user's environment, whereas tree-sitter's grammar is real, accurate,
 * and requires no external runtime.
 */
export async function parseSource(code: string, language: SupportedLanguage): Promise<AstSummary> {
  if (language === "javascript" || language === "typescript") {
    return extractJsTsSummary(code, language);
  }

  const parser = await createParser(language);
  const tree = parser.parse(code);
  const root = tree.rootNode as unknown as TreeSitterNode;
  const tokenCount = estimateTokenCount(root);
  const hasParseErrors = tree.rootNode.hasError();

  const summary =
    language === "c"
      ? extractCSummary(root, tokenCount)
      : language === "cpp"
        ? extractCppSummary(root, tokenCount)
        : language === "java"
          ? extractJavaSummary(root, tokenCount)
          : extractPythonSummary(root, tokenCount);

  return { ...summary, hasParseErrors };
}
