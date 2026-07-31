import type { TreeSitterNode } from "@algolens/parser";
import type { TreeSitterAnalysisConfig } from "../tree-sitter-language-configs.js";

/**
 * Computes the maximum loop nesting depth anywhere in the tree — e.g. a
 * loop containing another loop containing another loop is depth 3. This
 * is a genuinely different question from Phase 20's `loopCount` (which
 * just counts total loops); a file can have 5 loops all at depth 1
 * (sequential, not nested) or 2 loops at depth 2 (one nested inside the
 * other) — nesting depth is what actually signals potential O(n^2)+
 * behavior, not the raw count.
 */
export function computeMaxLoopNestingDepth(
  root: TreeSitterNode,
  config: TreeSitterAnalysisConfig
): number {
  let maxDepth = 0;

  function visit(node: TreeSitterNode, currentDepth: number): void {
    const isLoop = config.loopTypes.includes(node.type);
    const depthHere = isLoop ? currentDepth + 1 : currentDepth;
    maxDepth = Math.max(maxDepth, depthHere);

    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child) {
        visit(child, depthHere);
      }
    }
  }

  visit(root, 0);
  return maxDepth;
}
