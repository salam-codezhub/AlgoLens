import type { AlgorithmType } from "../algorithms/types.js";
import type { ComplexityClass } from "./types.js";

export interface AlgorithmComplexity {
  readonly bestCase: ComplexityClass;
  readonly averageCase: ComplexityClass;
  readonly worstCase: ComplexityClass;
  readonly reasoning: string;
}

/**
 * Well-established, textbook time complexities for each algorithm Phase
 * 22 can detect — real CS knowledge (CLRS/standard algorithms courses),
 * not derived or guessed per-instance. When Phase 22 confidently detects
 * one of these, using its known complexity is far more reliable than the
 * generic structural fallback (structural-estimator.ts) could ever be.
 *
 * A few worth explaining, since they're not simply "obvious":
 * - Quick Sort's worst case is O(n^2), not O(n log n) — a poor pivot
 *   choice (already-sorted input with a naive pivot) degrades it.
 * - Bubble Sort's best case is O(n), not O(1) — even an already-sorted
 *   array needs one full pass to confirm no swaps are needed.
 * - DFS/BFS are O(V+E) on a graph; expressed here as O(n) since this
 *   project's ComplexityClass doesn't have a distinct graph-size notion
 *   — V+E is linear in input size, so O(n) is the correct simplification.
 * - Backtracking's worst case is exponential by definition (it explores
 *   a decision tree) — O(2^n) is the standard textbook simplification,
 *   though the true exponent varies by problem (e.g. permutations are
 *   O(n!) specifically; this table uses the general-case default).
 */
export const ALGORITHM_COMPLEXITY_TABLE: Record<AlgorithmType, AlgorithmComplexity> = {
  "binary-search": {
    bestCase: "O(1)",
    averageCase: "O(log n)",
    worstCase: "O(log n)",
    reasoning:
      "Binary search halves the search space each iteration; best case finds the target immediately.",
  },
  "merge-sort": {
    bestCase: "O(n log n)",
    averageCase: "O(n log n)",
    worstCase: "O(n log n)",
    reasoning:
      "Merge sort always splits in half and merges in linear time, regardless of input order.",
  },
  "quick-sort": {
    bestCase: "O(n log n)",
    averageCase: "O(n log n)",
    worstCase: "O(n^2)",
    reasoning:
      "Quick sort's worst case occurs when the pivot is consistently the smallest or largest element (e.g. already-sorted input with a naive pivot choice).",
  },
  "bubble-sort": {
    bestCase: "O(n)",
    averageCase: "O(n^2)",
    worstCase: "O(n^2)",
    reasoning:
      "Bubble sort's best case (already sorted) still needs one full pass to confirm no swaps are needed; unsorted input needs up to n passes.",
  },
  dfs: {
    bestCase: "O(n)",
    averageCase: "O(n)",
    worstCase: "O(n)",
    reasoning: "DFS visits each vertex and edge once — O(V+E), linear in graph size.",
  },
  bfs: {
    bestCase: "O(n)",
    averageCase: "O(n)",
    worstCase: "O(n)",
    reasoning: "BFS visits each vertex and edge once — O(V+E), linear in graph size.",
  },
  trie: {
    bestCase: "O(1)",
    averageCase: "O(n)",
    worstCase: "O(n)",
    reasoning:
      "Trie insert/search time is proportional to the key's length, not the number of stored keys.",
  },
  heap: {
    bestCase: "O(1)",
    averageCase: "O(log n)",
    worstCase: "O(log n)",
    reasoning:
      "Heap insert/extract requires sifting at most the height of the tree, which is log n for n elements.",
  },
  "sliding-window": {
    bestCase: "O(n)",
    averageCase: "O(n)",
    worstCase: "O(n)",
    reasoning:
      "Each pointer traverses the array at most once, giving O(n) total work despite the nested-looking window logic.",
  },
  greedy: {
    bestCase: "O(n log n)",
    averageCase: "O(n log n)",
    worstCase: "O(n log n)",
    reasoning:
      "Typical greedy algorithms sort first (O(n log n)) then make one linear pass — the sort dominates.",
  },
  "dynamic-programming": {
    bestCase: "O(n)",
    averageCase: "O(n^2)",
    worstCase: "O(n^2)",
    reasoning:
      "Memoization avoids recomputation, but a 2D state table (common in DP) still costs O(n^2) to fill in the general case.",
  },
  backtracking: {
    bestCase: "O(n)",
    averageCase: "O(2^n)",
    worstCase: "O(2^n)",
    reasoning:
      "Backtracking explores a decision tree; without early pruning it's exponential in the worst case (the exact base depends on the specific problem's branching factor).",
  },
  hashmap: {
    bestCase: "O(1)",
    averageCase: "O(1)",
    worstCase: "O(n)",
    reasoning:
      "Hash map operations are O(1) on average; worst case degrades to O(n) only under heavy hash collisions.",
  },
  "two-pointer": {
    bestCase: "O(n)",
    averageCase: "O(n)",
    worstCase: "O(n)",
    reasoning:
      "Both pointers traverse the array at most once in total, giving O(n) despite using two indices.",
  },
};
