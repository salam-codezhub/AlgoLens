import type { AstSummary, TreeSitterNode } from "../types.js";
import { unwrapDeclaratorName } from "./c-family-declarator.js";
import { containsCallTo, findAllByType } from "./tree-walk.js";

/** Node type names verified empirically by parsing representative C++
 *  samples with tree-sitter-cpp and inspecting the real output. */
const FUNCTION_TYPE = "function_definition";
const CLASS_TYPES = ["class_specifier", "struct_specifier"];
const IMPORT_TYPE = "preproc_include";
const LOOP_TYPES = ["for_statement", "while_statement", "do_statement"];
const DECLARATION_TYPES = ["declaration", "field_declaration"];
const CALL_TYPE = "call_expression";

interface NamedFunction {
  readonly name: string;
  readonly body: TreeSitterNode | null;
}

export function extractCppSummary(root: TreeSitterNode, tokenCount: number): AstSummary {
  const importNodes = findAllByType(root, [IMPORT_TYPE]);
  const classNodes = findAllByType(root, CLASS_TYPES);
  const declarationNodes = findAllByType(root, DECLARATION_TYPES);

  const namedFunctions: NamedFunction[] = findAllByType(root, [FUNCTION_TYPE])
    .map((node) => ({
      name: unwrapDeclaratorName(node.childForFieldName("declarator")),
      body: node.childForFieldName("body"),
    }))
    .filter((entry): entry is NamedFunction => entry.name !== undefined);

  const recursiveFunctions = namedFunctions
    .filter((fn) => fn.body && containsCallTo(fn.body, fn.name, [CALL_TYPE], "function"))
    .map((fn) => fn.name);

  return {
    language: "cpp",
    tokenCount,
    imports: importNodes
      .map((node) => node.childForFieldName("path")?.text)
      .filter((path): path is string => path !== undefined),
    functions: namedFunctions.map((fn) => fn.name),
    classes: classNodes
      .map((node) => node.childForFieldName("name")?.text)
      .filter((name): name is string => name !== undefined),
    // Includes both free/local variable declarations and class field
    // declarations — both are genuinely variables in the file.
    variables: declarationNodes
      .map((node) => unwrapDeclaratorName(node.childForFieldName("declarator")))
      .filter((name): name is string => name !== undefined),
    loopCount: findAllByType(root, LOOP_TYPES).length,
    recursiveFunctions,
    hasParseErrors: false,
  };
}
