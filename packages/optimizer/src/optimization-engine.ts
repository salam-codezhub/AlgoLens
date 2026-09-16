import { createOptimizationDiff } from "./diff-generator.js";
import { generateOptimizationSuggestions } from "./optimization-service.js";
import type { OptimizationReport } from "./types.js";

export function optimizeCode(code: string): OptimizationReport {
  const suggestions = generateOptimizationSuggestions(code);

  const confidence =
    suggestions.length === 0
      ? 100
      : Math.round(
          suggestions.reduce((sum, suggestion) => sum + suggestion.confidence, 0) /
            suggestions.length
        );

  const risk = suggestions.some((suggestion) => suggestion.risk === "high")
    ? "high"
    : suggestions.some((suggestion) => suggestion.risk === "medium")
      ? "medium"
      : "low";

  const tradeOffs =
    suggestions.length === 0
      ? ["No optimization opportunities were identified by the current heuristics."]
      : [
          "Performance improvements may increase code complexity.",
          "Refactoring may improve readability while introducing additional abstractions.",
          "Modern language features should be checked against the project's supported runtime.",
        ];

  const optimizedCode = code;
  const diff = createOptimizationDiff(code, optimizedCode);

  const explanation =
    suggestions.length === 0
      ? "No optimization changes were applied. The original code is preserved."
      : "Optimization opportunities were identified, but no code changes were applied automatically. This preserves the existing behavior and requires explicit review before modification.";

  return {
    optimizedCode,
    suggestions,
    diff,
    confidence,
    risk,
    tradeOffs,
    explanation,
  };
}
