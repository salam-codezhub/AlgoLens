import type { SupportedLanguage } from "../language/types.js";

/**
 * A structural summary of a parsed file — the actual Phase 20 deliverables
 * (Tokens, Imports, Functions, Classes, Variables, Loops, Recursion),
 * extracted from the real Abstract Syntax Tree rather than approximated
 * from text.
 */
export interface AstSummary {
  readonly language: SupportedLanguage;
  readonly tokenCount: number;
  readonly imports: readonly string[];
  readonly functions: readonly string[];
  readonly classes: readonly string[];
  readonly variables: readonly string[];
  readonly loopCount: number;
  /** Names of functions that call themselves, directly. Mutual/indirect
   *  recursion (A calls B calls A) isn't detected here — that needs a full
   *  call graph, which is more naturally Phase 22's (Algorithm Detection)
   *  job, built on top of this summary rather than duplicated here. */
  readonly recursiveFunctions: readonly string[];
  readonly hasParseErrors: boolean;
}

/** Tree-sitter's own node shape — kept minimal/structural rather than
 *  importing web-tree-sitter's types directly into shared summary code,
 *  since Babel's AST (used for JS/TS) has a different node shape entirely
 *  and this interface only needs to describe what extractors walk. */
export interface TreeSitterNode {
  readonly type: string;
  readonly text: string;
  readonly childCount: number;
  readonly namedChildCount: number;
  child(index: number): TreeSitterNode | null;
  namedChild(index: number): TreeSitterNode | null;
  childForFieldName(fieldName: string): TreeSitterNode | null;
}
