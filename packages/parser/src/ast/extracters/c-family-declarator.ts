import type { TreeSitterNode } from "../types.js";

/**
 * C and C++ function/variable declarators nest the actual name several
 * levels deep and don't expose a flat "name" field the way Python/Java do
 * — e.g. `int add(int a, int b)` is
 * `function_definition > declarator: function_declarator > declarator: identifier`.
 * This unwraps that nesting to find the innermost identifier
 * (`identifier` for free functions/variables, `field_identifier` for C++
 * member functions/fields), verified empirically against real
 * tree-sitter-c/tree-sitter-cpp output rather than assumed.
 */
export function unwrapDeclaratorName(declarator: TreeSitterNode | null): string | undefined {
  let current = declarator;
  while (current) {
    if (current.type === "identifier" || current.type === "field_identifier") {
      return current.text;
    }
    // function_declarator, init_declarator, pointer_declarator, etc. all
    // nest the real name one level deeper under their own "declarator" field.
    const nested = current.childForFieldName("declarator");
    if (!nested) {
      return undefined;
    }
    current = nested;
  }
  return undefined;
}
