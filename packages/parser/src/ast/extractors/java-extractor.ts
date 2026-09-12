import type { AstSummary, TreeSitterNode } from "../types.js";
import { containsCallTo, findAllByType } from "./tree-walk.js";

/** Node type names verified empirically by parsing representative Java
 *  samples with tree-sitter-java and inspecting the real output. */
const FUNCTION_TYPES = ["method_declaration", "constructor_declaration"];
const CLASS_TYPE = "class_declaration";
const IMPORT_TYPE = "import_declaration";
const LOOP_TYPES = ["for_statement", "while_statement", "do_statement"];
const VARIABLE_DECL_TYPES = ["local_variable_declaration", "field_declaration"];
const CALL_TYPE = "method_invocation";

interface NamedFunction {
  readonly name: string;
  readonly body: TreeSitterNode | null;
}

function extractVariableNames(declarationNode: TreeSitterNode): string[] {
  // A single declaration can declare multiple variables
  // (`int a, b, c;`), each as its own variable_declarator child.
  const declarators = findAllByType(declarationNode, ["variable_declarator"]);
  return declarators
    .map((declarator) => declarator.childForFieldName("name")?.text)
    .filter((name): name is string => name !== undefined);
}

export function extractJavaSummary(root: TreeSitterNode, tokenCount: number): AstSummary {
  const classNodes = findAllByType(root, [CLASS_TYPE]);
  const importNodes = findAllByType(root, [IMPORT_TYPE]);
  const variableDeclNodes = findAllByType(root, VARIABLE_DECL_TYPES);

  const namedFunctions: NamedFunction[] = findAllByType(root, FUNCTION_TYPES)
    .map((node) => ({
      name: node.childForFieldName("name")?.text,
      body: node.childForFieldName("body"),
    }))
    .filter((entry): entry is NamedFunction => entry.name !== undefined);

  const recursiveFunctions = namedFunctions
    .filter((fn) => fn.body && containsCallTo(fn.body, fn.name, [CALL_TYPE], "name"))
    .map((fn) => fn.name);

  return {
    language: "java",
    tokenCount,
    // import_declaration's text is the whole statement, e.g.
    // "import java.util.List;" — strip the keyword/semicolon for a clean
    // package path rather than the raw statement text.
    imports: importNodes.map((node) =>
      node.text.replace(/^import\s+(static\s+)?/, "").replace(/;$/, "")
    ),
    functions: namedFunctions.map((fn) => fn.name),
    classes: classNodes
      .map((node) => node.childForFieldName("name")?.text)
      .filter((name): name is string => name !== undefined),
    variables: variableDeclNodes.flatMap(extractVariableNames),
    loopCount: findAllByType(root, LOOP_TYPES).length,
    recursiveFunctions,
    hasParseErrors: false,
  };
}
