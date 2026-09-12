import type { TreeSitterNode } from "../types.js";

/** Recursively visits every node in the tree, calling `visitor` on each. */
export function walk(node: TreeSitterNode, visitor: (node: TreeSitterNode) => void): void {
  visitor(node);
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child) {
      walk(child, visitor);
    }
  }
}

/** Collects every node whose `type` is in `types`, anywhere in the tree
 *  (including `node` itself). */
export function findAllByType(node: TreeSitterNode, types: readonly string[]): TreeSitterNode[] {
  const matches: TreeSitterNode[] = [];
  walk(node, (candidate) => {
    if (types.includes(candidate.type)) {
      matches.push(candidate);
    }
  });
  return matches;
}

/** Counts every node whose `type` is in `types`. */
export function countByType(node: TreeSitterNode, types: readonly string[]): number {
  return findAllByType(node, types).length;
}

/**
 * Checks whether `functionBody` contains a call to `functionName` —
 * direct recursion detection. Only looks at the immediate call target's
 * text, not resolved bindings (tree-sitter alone can't resolve scoping),
 * so this can theoretically false-positive on an unrelated same-named
 * function in a different scope; a real, scope-aware check is Phase 22's
 * (Algorithm Detection) job, built on top of this summary.
 */
export function containsCallTo(
  functionBody: TreeSitterNode,
  functionName: string,
  callNodeTypes: readonly string[],
  callTargetFieldName: string
): boolean {
  const calls = findAllByType(functionBody, callNodeTypes);
  return calls.some((call) => call.childForFieldName(callTargetFieldName)?.text === functionName);
}
