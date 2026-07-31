import { walk, type TreeSitterNode } from "@algolens/parser";
import type { UnusedSymbol } from "../types.js";
import type { TreeSitterAnalysisConfig } from "../tree-sitter-language-configs.js";

/**
 * Flags a declared name as possibly unused if it appears at most once as
 * an identifier in the whole file (i.e. only at its own declaration site).
 *
 * This is a real, honest heuristic, not full scope-resolved usage
 * analysis — true unused-variable detection needs to resolve each
 * identifier to its actual binding (which declaration it refers to,
 * respecting shadowing and scope), which neither tree-sitter's nor
 * Babel's bare AST does on its own. A name used only inside a *different*
 * scope that happens to share the same text won't be caught by this
 * (rare in practice, but real). `confidence` reflects this: high but not
 * absolute, lower than a hypothetical fully scope-resolved checker would
 * report.
 */
export function detectUnusedSymbols(
  root: TreeSitterNode,
  config: TreeSitterAnalysisConfig,
  declaredNames: readonly string[]
): UnusedSymbol[] {
  const occurrenceCounts = new Map<string, number>();
  const namesToCheck = new Set(declaredNames);

  walk(root, (node) => {
    if (config.identifierTypes.includes(node.type) && namesToCheck.has(node.text)) {
      occurrenceCounts.set(node.text, (occurrenceCounts.get(node.text) ?? 0) + 1);
    }
  });

  return declaredNames
    .filter((name) => (occurrenceCounts.get(name) ?? 0) <= 1)
    .map((name) => ({ name, confidence: 70 }));
}
