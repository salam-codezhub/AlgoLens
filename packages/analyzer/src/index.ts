export * from "./types.js";
export * from "./tree-sitter-language-configs.js";
export * from "./static-analyzer.js";
export * from "./storage/analysis-result-store.js";
export * from "./algorithms/types.js";
export * from "./algorithms/detector-engine.js";
export * from "./algorithms/algorithm-detectors.js";
export * from "./algorithms/algorithm-detector.js";
export * from "./time-complexity/types.js";
export * from "./time-complexity/algorithm-complexity-table.js";
export * from "./time-complexity/structural-estimator.js";
export * from "./time-complexity/time-complexity-engine.js";

/** Canonical package name, useful for logging and diagnostics. */
export const PACKAGE_NAME = "@algolens/analyzer" as const;
