import type { OptimizationSuggestion, OptimizationType } from "./types.js";

function createSuggestion(
  type: OptimizationType,
  title: string,
  description: string,
  rationale: string,
  risk: OptimizationSuggestion["risk"],
  confidence: number
): OptimizationSuggestion {
  return {
    type,
    title,
    description,
    rationale,
    risk,
    confidence,
  };
}

export function generateOptimizationSuggestions(code: string): readonly OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  if (/for\s*\([^)]*;\s*[^;]+;\s*[^)]*\)/.test(code)) {
    suggestions.push(
      createSuggestion(
        "performance",
        "Review loop work",
        "Inspect loop bodies for repeated calculations or unnecessary work.",
        "Reducing repeated work inside frequently executed loops can improve runtime.",
        "low",
        60
      )
    );
  }

  if (code.includes(".push(") && /for\s*\(/.test(code)) {
    suggestions.push(
      createSuggestion(
        "performance",
        "Review repeated array growth",
        "Consider whether the loop can avoid unnecessary intermediate array operations.",
        "Repeated mutations may add overhead when processing large collections.",
        "low",
        55
      )
    );
  }

  if (/var\s+\w+/.test(code)) {
    suggestions.push(
      createSuggestion(
        "modernization",
        "Prefer modern variable declarations",
        "Consider replacing var with const or let where appropriate.",
        "Block-scoped declarations make variable lifetime clearer and reduce accidental reassignment.",
        "low",
        90
      )
    );
  }

  if (/function\s+\w+\s*\([^)]*\)\s*\{/.test(code)) {
    suggestions.push(
      createSuggestion(
        "readability",
        "Review function responsibilities",
        "Consider splitting functions that perform multiple unrelated responsibilities.",
        "Smaller focused functions are generally easier to understand, test, and maintain.",
        "low",
        50
      )
    );
  }

  if (/\b(if|for|while|switch)\b/.test(code)) {
    suggestions.push(
      createSuggestion(
        "refactoring",
        "Review control-flow complexity",
        "Consider extracting complex branches or loops into focused helper functions.",
        "Reducing control-flow complexity can improve readability without changing intended behavior.",
        "low",
        50
      )
    );
  }

  return suggestions;
}
