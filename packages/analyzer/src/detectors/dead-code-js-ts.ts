import type { Node, Statement } from "@babel/types";
import { getBabelTraverse } from "@algolens/parser";
import type { DeadCodeLocation } from "../types.js";

const traverse = getBabelTraverse();

const TERMINATOR_TYPES = new Set([
  "ReturnStatement",
  "BreakStatement",
  "ContinueStatement",
  "ThrowStatement",
]);

/** Same concept as the tree-sitter version (dead-code.ts) — a statement
 *  following an unconditional terminator within the same block can never
 *  execute. Babel represents every block uniformly as `BlockStatement`
 *  (unlike tree-sitter, which has different block type names per
 *  language), so this only needs one node type to check. */
export function detectDeadCodeJsTs(ast: Node): DeadCodeLocation[] {
  const results: DeadCodeLocation[] = [];

  traverse(ast, {
    BlockStatement(path) {
      const statements: Statement[] = path.node.body;
      const terminatorIndex = statements.findIndex((statement) =>
        TERMINATOR_TYPES.has(statement.type)
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
    },
  });

  return results;
}
