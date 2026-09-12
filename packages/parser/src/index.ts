export * from "./language/types.js";
export * from "./language/extension-map.js";
export * from "./language/content-heuristics.js";
export * from "./language/language-detector.js";
export * from "./language/dominant-language.js";

export * from "./ast/types.js";
export * from "./ast/ast-parser.js";
export * from "./ast/tree-sitter-runtime.js";
export * from "./ast/extractors/tree-walk.js";
export * from "./ast/extractors/babel-interop.js";

/** Canonical package name, useful for logging and diagnostics. */
export const PACKAGE_NAME = "@algolens/parser" as const;
