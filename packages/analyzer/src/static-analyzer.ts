import { parse } from "@babel/parser";
import type { File } from "@babel/types";
import {
  createParser,
  findAllByType,
  getBabelTraverse,
  parseSource,
  type SupportedLanguage,
  type TreeSitterNode,
} from "@algolens/parser";
import { collectTokenTexts } from "./complexity/babel-halstead.js";
import { computeCyclomaticComplexityJsTs } from "./complexity/babel-cyclomatic.js";
import { computeHalsteadMetrics } from "./complexity/halstead.js";
import { computeMaintainabilityIndex } from "./complexity/maintainability-index.js";
import { computeCyclomaticComplexity } from "./complexity/tree-sitter-cyclomatic.js";
import { collectLeafTokenTexts } from "./complexity/tree-sitter-halstead.js";
import { detectDeadCodeJsTs } from "./detectors/dead-code-js-ts.js";
import { detectDeadCode } from "./detectors/dead-code.js";
import { computeMaxLoopNestingDepthJsTs } from "./detectors/nested-loops-js-ts.js";
import { computeMaxLoopNestingDepth } from "./detectors/nested-loops.js";
import { detectUnusedSymbols } from "./detectors/unused-symbols.js";
import {
  C_CONFIG,
  CPP_CONFIG,
  JAVA_CONFIG,
  PYTHON_CONFIG,
  type TreeSitterAnalysisConfig,
} from "./tree-sitter-language-configs.js";
import type { FunctionComplexity, StaticAnalysisResult, UnusedSymbol } from "./types.js";

const traverse = getBabelTraverse();

function countLines(code: string): number {
  return code.split("\n").length;
}

function configFor(language: "c" | "cpp" | "java" | "python"): TreeSitterAnalysisConfig {
  switch (language) {
    case "c":
      return C_CONFIG;
    case "cpp":
      return CPP_CONFIG;
    case "java":
      return JAVA_CONFIG;
    case "python":
      return PYTHON_CONFIG;
  }
}

/** Derives each import's locally-bound name (what you'd actually reference
 *  in code) — genuinely different from Phase 20's `imports` list, which
 *  shows the *source* (module path) for display, not the bound symbol.
 *  E.g. Python's `from collections import OrderedDict` binds
 *  "OrderedDict", not "collections". C/C++ #include doesn't bind a named
 *  symbol at all (textual inclusion, not an import), so it correctly
 *  returns nothing for those languages — not a gap, a real difference.
 *  Known limitation: doesn't resolve `as`-aliases to their alias name. */
function extractImportBoundNames(
  root: TreeSitterNode,
  language: "c" | "cpp" | "java" | "python"
): string[] {
  if (language === "c" || language === "cpp") {
    return [];
  }
  if (language === "python") {
    return findAllByType(root, ["import_statement", "import_from_statement"])
      .map((node) => {
        const nameField = node.childForFieldName("name");
        const text = nameField?.text ?? node.childForFieldName("module_name")?.text;
        return text?.split(".")[0];
      })
      .filter((name): name is string => name !== undefined);
  }
  // java
  return findAllByType(root, ["import_declaration"])
    .map((node) => node.text.replace(/^import\s+(static\s+)?/, "").replace(/;$/, ""))
    .map((path) => path.split(".").at(-1))
    .filter((name): name is string => name !== undefined);
}

async function analyzeTreeSitterLanguage(
  code: string,
  filePath: string,
  language: "c" | "cpp" | "java" | "python"
): Promise<StaticAnalysisResult> {
  const config = configFor(language);
  const [astSummary, parser] = await Promise.all([
    parseSource(code, language),
    createParser(language),
  ]);
  const tree = parser.parse(code);
  const root = tree.rootNode as unknown as TreeSitterNode;

  const functionNodes = findAllByType(root, [...config.functionTypes]);
  const functionComplexity: FunctionComplexity[] = functionNodes.map((node, index) => ({
    name: astSummary.functions[index] ?? `<anonymous ${String(index)}>`,
    cyclomaticComplexity: computeCyclomaticComplexity(node, config),
  }));

  const fileCyclomaticComplexity = computeCyclomaticComplexity(root, config);
  const halstead = computeHalsteadMetrics(collectLeafTokenTexts(root));
  const maintainabilityIndex = computeMaintainabilityIndex(
    halstead.volume,
    fileCyclomaticComplexity,
    countLines(code)
  );

  const importBoundNames = extractImportBoundNames(root, language);
  const unusedImports: UnusedSymbol[] = detectUnusedSymbols(root, config, importBoundNames);
  const unusedVariables: UnusedSymbol[] = detectUnusedSymbols(root, config, astSummary.variables);

  return {
    filePath,
    language,
    analyzedAt: Date.now(),
    loopCount: astSummary.loopCount,
    maxLoopNestingDepth: computeMaxLoopNestingDepth(root, config),
    recursiveFunctions: astSummary.recursiveFunctions,
    imports: astSummary.imports,
    unusedImports,
    unusedVariables,
    deadCode: detectDeadCode(root, config),
    functionComplexity,
    fileCyclomaticComplexity,
    maintainabilityIndex,
    ast: astSummary,
  };
}

async function analyzeJsTs(
  code: string,
  filePath: string,
  language: "javascript" | "typescript"
): Promise<StaticAnalysisResult> {
  const astSummary = await parseSource(code, language);

  const ast: File = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    errorRecovery: true,
    tokens: true,
  });

  const functionComplexity: FunctionComplexity[] = [];
  const declaredVariableNames = new Set(astSummary.variables);
  const importedBoundNames = new Set<string>();

  traverse(ast, {
    ImportSpecifier(path) {
      importedBoundNames.add(path.node.local.name);
    },
    ImportDefaultSpecifier(path) {
      importedBoundNames.add(path.node.local.name);
    },
    ImportNamespaceSpecifier(path) {
      importedBoundNames.add(path.node.local.name);
    },
    FunctionDeclaration(path) {
      if (path.node.id) {
        functionComplexity.push({
          name: path.node.id.name,
          cyclomaticComplexity: computeCyclomaticComplexityJsTs(path),
        });
      }
    },
    ClassMethod(path) {
      if (path.node.key.type === "Identifier") {
        functionComplexity.push({
          name: path.node.key.name,
          cyclomaticComplexity: computeCyclomaticComplexityJsTs(path),
        });
      }
    },
    ObjectMethod(path) {
      if (path.node.key.type === "Identifier") {
        functionComplexity.push({
          name: path.node.key.name,
          cyclomaticComplexity: computeCyclomaticComplexityJsTs(path),
        });
      }
    },
  });

  const fileCyclomaticComplexity =
    1 + functionComplexity.reduce((sum, fn) => sum + (fn.cyclomaticComplexity - 1), 0);
  const halstead = computeHalsteadMetrics(collectTokenTexts(ast, code));
  const maintainabilityIndex = computeMaintainabilityIndex(
    halstead.volume,
    fileCyclomaticComplexity,
    countLines(code)
  );

  // Occurrence-count heuristic (same as detectUnusedSymbols, but Babel's
  // identifier text isn't tied to one node "type" the way tree-sitter's
  // is, so this counts plain-text identifier occurrences directly).
  // Counts real *usages* of each name, excluding the identifier(s) at its
  // own declaration/binding site. This can't just count every Identifier
  // occurrence and assume the declaration site contributes exactly one:
  // a non-aliased `import { x } from 'y'` has TWO separate Identifier
  // nodes for "x" (`imported` and `local`, same name, same position) —
  // discovered by inspecting the real parsed output, not assumed — so a
  // naive occurrence count would need a threshold of "<= 2" for imports
  // but "<= 1" for variables, an inconsistency not worth carrying. Instead,
  // explicitly skip binding-site identifiers and check for zero real uses.
  function countRealUsages(names: ReadonlySet<string>): Map<string, number> {
    const counts = new Map<string, number>();
    traverse(ast, {
      Identifier(path) {
        if (!names.has(path.node.name)) {
          return;
        }
        const parentType = path.parentPath.node.type;
        const isBindingSite =
          (parentType === "VariableDeclarator" && path.key === "id") ||
          ((parentType === "ImportSpecifier" ||
            parentType === "ImportDefaultSpecifier" ||
            parentType === "ImportNamespaceSpecifier") &&
            (path.key === "imported" || path.key === "local"));
        if (isBindingSite) {
          return;
        }
        counts.set(path.node.name, (counts.get(path.node.name) ?? 0) + 1);
      },
    });
    return counts;
  }

  const variableUsages = countRealUsages(declaredVariableNames);
  const importUsages = countRealUsages(importedBoundNames);

  return {
    filePath,
    language,
    analyzedAt: Date.now(),
    loopCount: astSummary.loopCount,
    maxLoopNestingDepth: computeMaxLoopNestingDepthJsTs(ast),
    recursiveFunctions: astSummary.recursiveFunctions,
    imports: astSummary.imports,
    unusedImports: [...importedBoundNames]
      .filter((name) => (importUsages.get(name) ?? 0) === 0)
      .map((name) => ({ name, confidence: 70 })),
    unusedVariables: [...declaredVariableNames]
      .filter((name) => (variableUsages.get(name) ?? 0) === 0)
      .map((name) => ({ name, confidence: 70 })),
    deadCode: detectDeadCodeJsTs(ast),
    functionComplexity,
    fileCyclomaticComplexity,
    maintainabilityIndex,
    ast: astSummary,
  };
}

/**
 * Runs the full Static Analysis Engine (Phase 21) over `code` and returns
 * a {@link StaticAnalysisResult}. Builds directly on Phase 20's
 * {@link parseSource} rather than re-deriving what it already extracts
 * (imports, functions, classes, variables, loop count, recursion).
 */
export async function analyzeSource(
  code: string,
  filePath: string,
  language: SupportedLanguage
): Promise<StaticAnalysisResult> {
  if (language === "javascript" || language === "typescript") {
    return analyzeJsTs(code, filePath, language);
  }
  return analyzeTreeSitterLanguage(code, filePath, language);
}
