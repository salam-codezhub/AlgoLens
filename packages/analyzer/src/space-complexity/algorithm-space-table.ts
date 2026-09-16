import type { AlgorithmType } from "../algorithms/types.js";
import type { SpaceComplexityClass } from "./types.js";

export interface AlgorithmSpaceProfile {
  readonly auxiliarySpace: SpaceComplexityClass;
  readonly stackSpace: SpaceComplexityClass;
  readonly heapSpace: SpaceComplexityClass;
  readonly reasoning: string;
}

export const ALGORITHM_SPACE_TABLE: Record<AlgorithmType, AlgorithmSpaceProfile> = {
  "binary-search": {
    auxiliarySpace: "O(1)",
    stackSpace: "O(1)",
    heapSpace: "O(1)",
    reasoning: "Iterative binary search uses constant auxiliary, stack, and heap space.",
  },

  "merge-sort": {
    auxiliarySpace: "O(n)",
    stackSpace: "O(log n)",
    heapSpace: "O(n)",
    reasoning:
      "Merge sort requires an auxiliary array proportional to n and recursion depth of O(log n).",
  },

  "quick-sort": {
    auxiliarySpace: "O(log n)",
    stackSpace: "O(log n)",
    heapSpace: "O(1)",
    reasoning:
      "Quick sort uses recursion stack space; balanced partitions give O(log n) stack depth.",
  },

  "bubble-sort": {
    auxiliarySpace: "O(1)",
    stackSpace: "O(1)",
    heapSpace: "O(1)",
    reasoning: "Bubble sort sorts in place and uses only constant additional space.",
  },

  dfs: {
    auxiliarySpace: "O(n)",
    stackSpace: "O(n)",
    heapSpace: "O(n)",
    reasoning:
      "DFS may store visited state and a recursion or explicit traversal stack proportional to graph size.",
  },

  bfs: {
    auxiliarySpace: "O(n)",
    stackSpace: "O(1)",
    heapSpace: "O(n)",
    reasoning: "BFS requires a queue and visited state that can grow linearly with the graph size.",
  },

  trie: {
    auxiliarySpace: "O(n)",
    stackSpace: "O(1)",
    heapSpace: "O(n)",
    reasoning:
      "A trie stores nodes and child references proportional to the amount of inserted key data.",
  },

  heap: {
    auxiliarySpace: "O(1)",
    stackSpace: "O(1)",
    heapSpace: "O(n)",
    reasoning:
      "Heap-based structures store elements in the heap representation, requiring O(n) storage.",
  },

  "sliding-window": {
    auxiliarySpace: "O(1)",
    stackSpace: "O(1)",
    heapSpace: "O(1)",
    reasoning:
      "A standard sliding-window implementation uses a constant number of pointers and counters.",
  },

  greedy: {
    auxiliarySpace: "O(1)",
    stackSpace: "O(1)",
    heapSpace: "O(n)",
    reasoning:
      "Greedy algorithms generally use constant auxiliary state; storage may be O(n) when the input or sorted representation is copied.",
  },

  "dynamic-programming": {
    auxiliarySpace: "O(n^2)",
    stackSpace: "O(1)",
    heapSpace: "O(n^2)",
    reasoning:
      "A general two-dimensional dynamic-programming state table can require O(n^2) auxiliary storage.",
  },

  backtracking: {
    auxiliarySpace: "O(n)",
    stackSpace: "O(n)",
    heapSpace: "O(1)",
    reasoning:
      "Backtracking can require recursion depth proportional to the decision depth, giving O(n) stack space.",
  },

  hashmap: {
    auxiliarySpace: "O(n)",
    stackSpace: "O(1)",
    heapSpace: "O(n)",
    reasoning: "A hash map stores entries proportional to the number of stored elements.",
  },

  "two-pointer": {
    auxiliarySpace: "O(1)",
    stackSpace: "O(1)",
    heapSpace: "O(1)",
    reasoning:
      "A standard two-pointer implementation uses only a constant number of indices and temporary values.",
  },
};
