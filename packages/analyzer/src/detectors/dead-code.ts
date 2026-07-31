import { walk, type TreeSitterNode } from "@algolens/parser";
import type { DeadCodeLocation } from "../types.js";
import type { TreeSitterAnalysisConfig } from "../tree-sitter-language-configs.js";

/**
 * Detects statements that can never execute because they follow an
 * unconditional terminator (return/break/continue/throw) within the same
 * block — the classic, well-defined "dead code" pattern. Doesn't attempt
 * to detect other forms of dead code (an always-false `if` condition,
 * code after an infinite loop with no break) — those need actual control-
 * flow/value analysis, a different and much larger problem than syntactic
 * unreachability.
 */
export function detectDeadCode(
  root: TreeSitterNode,
  config: TreeSitterAnalysisConfig
): DeadCodeLocation[] {
  const results: DeadCodeLocation[] = [];

  walk(root, (node) => {
    if (!config.blockTypes.includes(node.type)) {
      return;
    }

    const statements: TreeSitterNode[] = [];
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child) {
        statements.push(child);
      }
    }

    const terminatorIndex = statements.findIndex((statement) =>
      config.terminatorTypes.includes(statement.type)
    );

    if (terminatorIndex !== -1 && terminatorIndex < statements.length - 1) {
      const terminator = statements[terminatorIndex];
      if (terminator) {
        results.push({
          afterStatementType: terminator.type,
          unreachableStatementCount: statements.length - terminatorIndex - 1,
        });
      }
    }
  });

  return results;
}
