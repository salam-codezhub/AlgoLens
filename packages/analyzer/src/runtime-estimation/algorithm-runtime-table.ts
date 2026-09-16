import type { AlgorithmType } from "../algorithms/types.js";
import type { RuntimeEstimateClass } from "./types.js";

export interface AlgorithmRuntimeProfile {
  readonly estimatedTime: RuntimeEstimateClass;
  readonly reasoning: string;
}

export const ALGORITHM_RUNTIME_TABLE: Record<AlgorithmType, AlgorithmRuntimeProfile> = {
  "binary-search": {
    estimatedTime: "O(log n)",
    reasoning: "Binary search halves the search space on each iteration.",
  },
  "merge-sort": {
    estimatedTime: "O(n log n)",
    reasoning: "Merge sort recursively divides the input and merges linear-sized partitions.",
  },
  "quick-sort": {
    estimatedTime: "O(n log n)",
    reasoning: "Quick sort typically partitions the input across logarithmic recursion levels.",
  },
  "bubble-sort": {
    estimatedTime: "O(n^2)",
    reasoning: "Bubble sort may compare and swap elements across quadratic nested iterations.",
  },
  dfs: {
    estimatedTime: "O(n)",
    reasoning:
      "DFS visits graph nodes and edges in linear time for standard adjacency-list traversal.",
  },
  bfs: {
    estimatedTime: "O(n)",
    reasoning:
      "BFS visits graph nodes and edges in linear time for standard adjacency-list traversal.",
  },
  trie: {
    estimatedTime: "O(n)",
    reasoning: "Trie operations depend on traversing characters of the input key.",
  },
  heap: {
    estimatedTime: "O(log n)",
    reasoning: "Heap insertion or removal maintains heap order across logarithmic height.",
  },
  "sliding-window": {
    estimatedTime: "O(n)",
    reasoning:
      "A standard sliding-window traversal advances its boundaries through the input once.",
  },
  greedy: {
    estimatedTime: "O(n)",
    reasoning:
      "A typical greedy algorithm processes the input through a linear sequence of decisions.",
  },
  "dynamic-programming": {
    estimatedTime: "O(n^2)",
    reasoning:
      "A general two-dimensional dynamic-programming solution evaluates a quadratic number of states.",
  },
  backtracking: {
    estimatedTime: "O(2^n)",
    reasoning: "Backtracking may explore an exponential number of possible decision combinations.",
  },
  hashmap: {
    estimatedTime: "O(1)",
    reasoning: "Hash map lookup, insertion, and deletion are expected constant-time operations.",
  },
  "two-pointer": {
    estimatedTime: "O(n)",
    reasoning:
      "Two-pointer traversal typically advances each pointer through the input without revisiting elements.",
  },
};
