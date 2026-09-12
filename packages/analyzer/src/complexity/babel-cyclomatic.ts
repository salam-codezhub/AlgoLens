import type { NodePath } from "@babel/traverse";

/** ESTree/Babel node types verified against @babel/parser's own AST spec
 *  — stable, well-documented, unchanged for years. */
const DECISION_TYPES = new Set([
  "IfStatement",
  "SwitchCase",
  "CatchClause",
  "ConditionalExpression",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
]);

/**
 * Same formula as the tree-sitter version (tree-sitter-cyclomatic.ts):
 * 1 + decision points + short-circuit logical operators.
 *
 * Takes a {@link NodePath} rather than a bare `Node` and traverses via
 * `path.traverse()` (not the standalone `traverse()` function) so it
 * correctly inherits scope context from its parent path — calling the
 * standalone traverse on an arbitrary sub-node with no established scope
 * is fragile; this is the same safe pattern Phase 20's recursion detector
 * (babel-extractor.ts) already uses.
 */
export function computeCyclomaticComplexityJsTs(scopePath: NodePath): number {
  let decisionCount = 0;
  let logicalOperatorCount = 0;

  scopePath.traverse({
    enter(path: NodePath) {
      if (DECISION_TYPES.has(path.node.type)) {
        decisionCount++;
      }
      if (
        path.node.type === "LogicalExpression" &&
        (path.node.operator === "&&" || path.node.operator === "||")
      ) {
        logicalOperatorCount++;
      }
    },
  });

  return 1 + decisionCount + logicalOperatorCount;
}
