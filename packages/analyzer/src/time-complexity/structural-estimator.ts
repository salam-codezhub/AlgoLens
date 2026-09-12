import type { StaticAnalysisResult } from "../types.js";
import type { ComplexityClass, TimeComplexityEstimate } from "./types.js";

/** Same halving-computation check used by Phase 22's algorithm detection
 *  (algorithms/signals.ts) — reimplemented narrowly here rather than
 *  imported, since that module's signal takes an AlgorithmDetectionContext
 *  this estimator doesn't have. */
function hasHalvingComputation(code: string): boolean {
  const pairedBound = /[a-z_]\w*\s*[+]\s*[a-z_]\w*\s*\)?\s*(\/\s*2|>>\s*1)/i;
  const singleOperand = /[a-z_]\w*(\.length|\.size\(\))?\s*(\/\s*2|>>\s*1)\b/i;
  return pairedBound.test(code) || singleOperand.test(code);
}

/** A recursive function that calls itself 2+ times per invocation (e.g.
 *  naive Fibonacci's `fib(n-1) + fib(n-2)`) branches — the hallmark of
 *  exponential blowup without memoization. Counts textual call-site
 *  occurrences of the function name followed by `(`, minus one for the
 *  function's own declaration, as a practical proxy for call count (the
 *  same category of heuristic Phase 22's algorithm detection already
 *  uses — a real, checkable signal, not a guess). */
function hasBranchingRecursion(code: string, functionName: string): boolean {
  const callPattern = new RegExp(`\\b${functionName}\\s*\\(`, "g");
  const occurrences = code.match(callPattern)?.length ?? 0;
  return occurrences >= 3; // 1 declaration/name reference + 2+ recursive calls
}

const NESTING_TO_CLASS: readonly ComplexityClass[] = ["O(1)", "O(n)", "O(n^2)", "O(n^3)"];

function classForNestingDepth(depth: number): ComplexityClass {
  return NESTING_TO_CLASS[Math.min(depth, NESTING_TO_CLASS.length - 1)] ?? "O(n^3)";
}

/**
 * Estimates time complexity from structural evidence alone (loop nesting
 * depth, recursion shape) when no specific algorithm was confidently
 * detected (see time-complexity-engine.ts, which tries the algorithm
 * table first). Inherently less certain than a known algorithm's textbook
 * complexity — reflected in the lower confidence score.
 */
export function estimateFromStructure(
  code: string,
  analysis: StaticAnalysisResult
): TimeComplexityEstimate {
  const hasRecursion = analysis.recursiveFunctions.length > 0;
  const nestingDepth = analysis.maxLoopNestingDepth;

  if (hasRecursion) {
    const branching = analysis.recursiveFunctions.some((name) => hasBranchingRecursion(code, name));
    const halving = hasHalvingComputation(code);

    if (branching) {
      return {
        bestCase: "O(n)",
        averageCase: "O(2^n)",
        worstCase: "O(2^n)",
        explanation: `Recursive function(s) [${analysis.recursiveFunctions.join(", ")}] call themselves multiple times per invocation without an evident memoization pattern — classic exponential branching recursion (e.g. naive Fibonacci-style).`,
        confidence: 55,
      };
    }

    if (halving && nestingDepth === 0) {
      return {
        bestCase: "O(1)",
        averageCase: "O(log n)",
        worstCase: "O(log n)",
        explanation: `Recursive function(s) [${analysis.recursiveFunctions.join(", ")}] combined with a halving computation on the search space — logarithmic recursion depth.`,
        confidence: 55,
      };
    }

    if (halving && nestingDepth >= 1) {
      return {
        bestCase: "O(n log n)",
        averageCase: "O(n log n)",
        worstCase: "O(n log n)",
        explanation: `Recursive function(s) [${analysis.recursiveFunctions.join(", ")}] split the input in half (halving computation present) and also do linear work per level (a loop is present) — the classic divide-and-conquer shape.`,
        confidence: 50,
      };
    }

    return {
      bestCase: "O(n)",
      averageCase: "O(n)",
      worstCase: "O(n)",
      explanation: `Recursive function(s) [${analysis.recursiveFunctions.join(", ")}] reduce the problem by a constant amount per call (no halving pattern detected) — linear recursion depth.`,
      confidence: 50,
    };
  }

  if (nestingDepth === 0) {
    return {
      bestCase: "O(1)",
      averageCase: "O(1)",
      worstCase: "O(1)",
      explanation: "No loops or recursion detected — constant-time control flow.",
      confidence: 60,
    };
  }

  const estimatedClass = classForNestingDepth(nestingDepth);
  const hasEarlyExit = /\bbreak\b/.test(code);

  if (hasEarlyExit && nestingDepth === 1) {
    return {
      bestCase: "O(1)",
      averageCase: estimatedClass,
      worstCase: estimatedClass,
      explanation: `A single loop (depth ${String(nestingDepth)}) with a "break" present suggests an early exit is possible — best case can terminate immediately, but average/worst case still scan the full input.`,
      confidence: 45,
    };
  }

  return {
    bestCase: estimatedClass,
    averageCase: estimatedClass,
    worstCase: estimatedClass,
    explanation: `Maximum loop nesting depth is ${String(nestingDepth)}, with no data-dependent early exit detected — all cases scan the input the same way.`,
    confidence: 55,
  };
}
