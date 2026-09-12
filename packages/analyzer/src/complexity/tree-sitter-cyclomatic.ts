import { findAllByType, type TreeSitterNode } from "@algolens/parser";
import type { TreeSitterAnalysisConfig } from "../tree-sitter-language-configs.js";

/**
 * McCabe cyclomatic complexity: 1 (baseline path) + one for every
 * decision point (if/case/catch/loop) + one for every short-circuit
 * logical operator (&&/|| and their language-specific equivalents), all
 * within `scopeNode` (typically a single function's body, or a whole file
 * for the file-level aggregate). This is the standard, well-established
 * formula — not an approximation.
 */
export function computeCyclomaticComplexity(
  scopeNode: TreeSitterNode,
  config: TreeSitterAnalysisConfig
): number {
  const decisionCount = findAllByType(scopeNode, [
    ...config.decisionTypes,
    ...config.loopTypes,
  ]).length;

  const logicalOperatorCount = findAllByType(scopeNode, [config.logicalOperatorNodeType]).filter(
    (node) => config.logicalOperatorValues.includes(node.childForFieldName("operator")?.text ?? "")
  ).length;

  return 1 + decisionCount + logicalOperatorCount;
}
