import _traverse from "@babel/traverse";

/**
 * @babel/traverse's CJS/ESM interop is inconsistent across bundlers — the
 * callable function sometimes lands on `.default`, sometimes as the
 * module itself. Centralized here (rather than duplicated in every
 * consumer) since both packages/parser's own Babel extractor and
 * packages/analyzer's Babel-based detectors need it.
 */
export function getBabelTraverse(): typeof _traverse {
  return typeof _traverse === "function"
    ? _traverse
    : (_traverse as { default: typeof _traverse }).default;
}
