import type { AstSummary, TreeSitterNode } from "../types.js";
import { containsCallTo, findAllByType } from "./tree-walk.js";

/** Node type names verified empirically by parsing representative Python
 *  samples with tree-sitter-python and inspecting the real output — not
 *  guessed from memory or documentation alone. */
const FUNCTION_TYPE = "function_definition";
const CLASS_TYPE = "class_definition";
const IMPORT_TYPES = ["import_statement", "import_from_statement"];
const LOOP_TYPES = ["for_statement", "while_statement"];
const ASSIGNMENT_TYPE = "assignment";
const CALL_TYPE = "call";

function extractImportName(node: TreeSitterNode): string | undefined {
  // import_from_statement has module_name; plain import_statement has name.
  const field = node.childForFieldName("module_name") ?? node.childForFieldName("name");
  return field?.text;
}

interface NamedFunction {
  readonly name: string;
  readonly body: TreeSitterNode | null;
}

export function extractPythonSummary(root: TreeSitterNode, tokenCount: number): AstSummary {
  const classNodes = findAllByType(root, [CLASS_TYPE]);
  const importNodes = findAllByType(root, IMPORT_TYPES);
  const assignmentNodes = findAllByType(root, [ASSIGNMENT_TYPE]);

  const namedFunctions: NamedFunction[] = findAllByType(root, [FUNCTION_TYPE])
    .map((node) => ({
      name: node.childForFieldName("name")?.text,
      body: node.childForFieldName("body"),
    }))
    .filter((entry): entry is NamedFunction => entry.name !== undefined);

  const recursiveFunctions = namedFunctions
    .filter((fn) => fn.body && containsCallTo(fn.body, fn.name, [CALL_TYPE], "function"))
    .map((fn) => fn.name);

  return {
    language: "python",
    tokenCount,
    imports: importNodes
      .map(extractImportName)
      .filter((name): name is string => name !== undefined),
    functions: namedFunctions.map((fn) => fn.name),
    classes: classNodes
      .map((node) => node.childForFieldName("name")?.text)
      .filter((name): name is string => name !== undefined),
    // Only plain `identifier = ...` assignments count as a variable — not
    // attribute assignment (`self.x = ...`) or subscript assignment
    // (`d[k] = ...`), which aren't variable declarations.
    variables: assignmentNodes
      .map((node) => node.childForFieldName("left"))
      .filter((left): left is TreeSitterNode => left?.type === "identifier")
      .map((left) => left.text),
    loopCount: findAllByType(root, LOOP_TYPES).length,
    recursiveFunctions,
    hasParseErrors: false,
  };
}
