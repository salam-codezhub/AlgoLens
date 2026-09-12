import type { AstSummary, TreeSitterNode } from "../types.js";
import { unwrapDeclaratorName } from "./c-family-declarator.js";
import { containsCallTo, findAllByType } from "./tree-walk.js";

/** Node type names verified empirically by parsing representative C
 *  samples with tree-sitter-c and inspecting the real output. */
const FUNCTION_TYPE = "function_definition";
const IMPORT_TYPE = "preproc_include";
const LOOP_TYPES = ["for_statement", "while_statement", "do_statement"];
const DECLARATION_TYPE = "declaration";
const CALL_TYPE = "call_expression";

interface NamedFunction {
  readonly name: string;
  readonly body: TreeSitterNode | null;
}

export function extractCSummary(root: TreeSitterNode, tokenCount: number): AstSummary {
  const importNodes = findAllByType(root, [IMPORT_TYPE]);
  const declarationNodes = findAllByType(root, [DECLARATION_TYPE]);

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
    language: "c",
    tokenCount,
    imports: importNodes
      .map((node) => node.childForFieldName("path")?.text)
      .filter((path): path is string => path !== undefined),
    functions: namedFunctions.map((fn) => fn.name),
    // C has no class construct at all — genuinely always empty, not an
    // omission.
    classes: [],
    variables: declarationNodes
      .map((node) => unwrapDeclaratorName(node.childForFieldName("declarator")))
      .filter((name): name is string => name !== undefined),
    loopCount: findAllByType(root, LOOP_TYPES).length,
    recursiveFunctions,
    hasParseErrors: false,
  };
}
