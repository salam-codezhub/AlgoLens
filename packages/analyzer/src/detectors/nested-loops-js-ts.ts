import type { Node } from "@babel/types";
import type { NodePath } from "@babel/traverse";
import { getBabelTraverse } from "@algolens/parser";

const traverse = getBabelTraverse();

const LOOP_TYPES = new Set([
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
]);

/** Same concept as the tree-sitter version (nested-loops.ts) — tracked via
 *  Babel's enter/exit visitor pair to increment/decrement depth around
 *  each loop node, the natural way to track depth with Babel's
 *  visitor-based traversal API. */
export function computeMaxLoopNestingDepthJsTs(ast: Node): number {
  let currentDepth = 0;
  let maxDepth = 0;

  traverse(ast, {
    enter(path: NodePath) {
      if (LOOP_TYPES.has(path.node.type)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    },
    exit(path: NodePath) {
      if (LOOP_TYPES.has(path.node.type)) {
        currentDepth--;
      }
    },
  });

  return maxDepth;
}
