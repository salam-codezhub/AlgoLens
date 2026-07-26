import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type { AstSummary } from "../types.js";

// @babel/traverse's CJS/ESM interop is inconsistent across bundlers — the
// callable function sometimes lands on `.default`, sometimes as the module
// itself. Handling both defensively is standard practice for this package.
const traverse =
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as { default: typeof _traverse }).default;

interface NamedFunction {
  readonly name: string;
  readonly path: NodePath<t.Function>;
}

function isSelfCall(callee: t.CallExpression["callee"], name: string): boolean {
  if (callee.type === "Identifier") {
    return callee.name === name;
  }
  // Method called via `this.foo()`.
  if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
    return callee.object.type === "ThisExpression" && callee.property.name === name;
  }
  return false;
}

function isRecursive(fn: NamedFunction): boolean {
  let found = false;
  fn.path.traverse({
    CallExpression(callPath) {
      if (isSelfCall(callPath.node.callee, fn.name)) {
        found = true;
        callPath.stop();
      }
    },
  });
  return found;
}

/**
 * Parses JavaScript or TypeScript (including JSX/TSX) with `@babel/parser`
 * and extracts the Phase 20 deliverables via `@babel/traverse`. Both
 * plugins are always enabled together (`typescript` + `jsx`) rather than
 * branching on the exact language — Babel accepts valid JS as a subset of
 * the TS-with-JSX grammar, so this is simpler and never rejects a file
 * that would otherwise parse correctly.
 */
export function extractJsTsSummary(
  code: string,
  language: "javascript" | "typescript"
): AstSummary {
  const emptySummary: AstSummary = {
    language,
    tokenCount: 0,
    imports: [],
    functions: [],
    classes: [],
    variables: [],
    loopCount: 0,
    recursiveFunctions: [],
    hasParseErrors: true,
  };

  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      errorRecovery: true,
      tokens: true,
    });
  } catch {
    // errorRecovery:true handles many syntax errors gracefully (producing
    // an AST with ast.errors populated), but Babel can still throw outright
    // on sufficiently malformed input (e.g. an unclosed parameter list) —
    // this is real, current Babel behavior, not a hypothetical edge case
    // (verified by triggering it directly). A syntax error, even a fatal
    // one, should never crash the caller — it should just report that
    // parsing failed.
    return emptySummary;
  }

  const imports: string[] = [];
  const classes: string[] = [];
  const variables: string[] = [];
  const namedFunctions: NamedFunction[] = [];
  let loopCount = 0;

  traverse(ast, {
    ImportDeclaration(path) {
      imports.push(path.node.source.value);
    },
    ClassDeclaration(path) {
      if (path.node.id) {
        classes.push(path.node.id.name);
      }
    },
    VariableDeclarator(path) {
      if (path.node.id.type === "Identifier") {
        variables.push(path.node.id.name);
      }
    },
    "ForStatement|ForInStatement|ForOfStatement|WhileStatement|DoWhileStatement"() {
      loopCount++;
    },
    FunctionDeclaration(path) {
      if (path.node.id) {
        namedFunctions.push({ name: path.node.id.name, path });
      }
    },
    ClassMethod(path) {
      if (path.node.key.type === "Identifier") {
        namedFunctions.push({ name: path.node.key.name, path });
      }
    },
    ObjectMethod(path) {
      if (path.node.key.type === "Identifier") {
        namedFunctions.push({ name: path.node.key.name, path });
      }
    },
  });

  return {
    language,
    tokenCount: ast.tokens?.length ?? 0,
    imports,
    functions: namedFunctions.map((fn) => fn.name),
    classes,
    variables,
    loopCount,
    recursiveFunctions: namedFunctions.filter(isRecursive).map((fn) => fn.name),
    hasParseErrors: ast.errors.length > 0,
  };
}
