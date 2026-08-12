import type { AlgorithmDetector } from "./detector-engine.js";
import {
  hasHalvingComputation,
  hasKeyword,
  hasLoop,
  hasNestedLoop,
  hasPattern,
  hasRecursion,
  hasSwapPattern,
} from "./signals.js";

/**
 * Fourteen detectors, one per MASTER_02_PHASES.md's Phase 22 "Support"
 * list. Every signal here is a genuine, checkable structural or naming
 * pattern — not a placeholder that always fires. False negatives are
 * expected and fine (a well-written but unusually-named implementation
 * won't match); the design goal is that a match, when it happens, is a
 * real corroborated signal, not a guess dressed up as one.
 */
export const ALGORITHM_DETECTORS: readonly AlgorithmDetector[] = [
  {
    algorithm: "binary-search",
    minSignalsRequired: 2,
    disqualifiers: [
      {
        description:
          "merge/pivot/partition keyword (stronger, more specific evidence of a different algorithm)",
        weight: 1,
        test: (ctx) => hasKeyword(ctx, "merge", "pivot", "partition"),
      },
    ],
    signals: [
      { description: '"mid" naming', weight: 3, test: (ctx) => hasKeyword(ctx, "mid") },
      {
        description: "low/high or left/right bound naming",
        weight: 1,
        test: (ctx) => hasKeyword(ctx, "low", "high") || hasKeyword(ctx, "left", "right"),
      },
      { description: "halving computation on a bound", weight: 3, test: hasHalvingComputation },
      {
        description: "single loop or recursion (not nested)",
        weight: 2,
        test: (ctx) => (hasLoop(ctx) || hasRecursion(ctx)) && !hasNestedLoop(ctx),
      },
      {
        description: "target/search keyword",
        weight: 1,
        test: (ctx) => hasKeyword(ctx, "target", "search"),
      },
    ],
  },
  {
    algorithm: "merge-sort",
    minSignalsRequired: 2,
    signals: [
      { description: '"merge" keyword', weight: 2, test: (ctx) => hasKeyword(ctx, "merge") },
      { description: "recursion", weight: 2, test: hasRecursion },
      {
        description: "halving computation (splitting the array)",
        weight: 2,
        test: hasHalvingComputation,
      },
      { description: "loop present (the merge step)", weight: 1, test: hasLoop },
    ],
  },
  {
    algorithm: "quick-sort",
    minSignalsRequired: 2,
    signals: [
      {
        description: '"pivot"/"partition" keyword',
        weight: 3,
        test: (ctx) => hasKeyword(ctx, "pivot", "partition"),
      },
      { description: "recursion", weight: 2, test: hasRecursion },
      { description: "swap pattern", weight: 1, test: hasSwapPattern },
    ],
  },
  {
    algorithm: "bubble-sort",
    minSignalsRequired: 2,
    signals: [
      { description: "nested loop (depth >= 2)", weight: 2, test: (ctx) => hasNestedLoop(ctx, 2) },
      { description: "swap pattern", weight: 2, test: hasSwapPattern },
      {
        description: "adjacent-index comparison (i, i+1)",
        weight: 2,
        test: (ctx) => hasPattern(ctx, /\[\s*\w+\s*\]\s*[<>]\s*\w+\s*\[\s*\w+\s*\+\s*1\s*\]/),
      },
      { description: '"bubble" keyword', weight: 1, test: (ctx) => hasKeyword(ctx, "bubble") },
    ],
  },
  {
    algorithm: "dfs",
    minSignalsRequired: 2,
    signals: [
      {
        description: '"visited" tracking',
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "visited", "visit"),
      },
      {
        description: "recursion or explicit stack",
        weight: 2,
        test: (ctx) => hasRecursion(ctx) || hasKeyword(ctx, "stack"),
      },
      {
        description: "graph/tree traversal naming",
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "neighbor", "neighbors", "adjacent", "graph", "children"),
      },
      {
        description: '"dfs"/"depth" keyword',
        weight: 1,
        test: (ctx) => hasKeyword(ctx, "dfs", "depth"),
      },
    ],
  },
  {
    algorithm: "bfs",
    minSignalsRequired: 2,
    signals: [
      { description: '"queue" usage', weight: 3, test: (ctx) => hasKeyword(ctx, "queue") },
      {
        description: '"visited" tracking',
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "visited", "visit"),
      },
      { description: "loop present", weight: 1, test: hasLoop },
      {
        description: '"bfs"/"level" keyword',
        weight: 1,
        test: (ctx) => hasKeyword(ctx, "bfs", "level"),
      },
    ],
  },
  {
    algorithm: "trie",
    minSignalsRequired: 2,
    signals: [
      {
        description: '"trie"/"TrieNode" naming',
        weight: 3,
        test: (ctx) => hasKeyword(ctx, "trie", "trienode"),
      },
      {
        description: '"children" map/array',
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "children"),
      },
      {
        description: "end-of-word marker",
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "isendofword", "isend", "endofword", "is_end", "is_word"),
      },
    ],
  },
  {
    algorithm: "heap",
    minSignalsRequired: 1,
    signals: [
      {
        description: '"heap"/priority-queue naming',
        weight: 3,
        test: (ctx) => hasKeyword(ctx, "heap", "priorityqueue", "priority_queue"),
      },
      {
        description: "heapify/sift operation naming",
        weight: 3,
        test: (ctx) =>
          hasKeyword(
            ctx,
            "heapify",
            "siftup",
            "siftdown",
            "sift_up",
            "sift_down",
            "bubbleup",
            "bubbledown",
            "heappush",
            "heappop"
          ),
      },
    ],
  },
  {
    algorithm: "sliding-window",
    minSignalsRequired: 2,
    signals: [
      { description: '"window" keyword', weight: 3, test: (ctx) => hasKeyword(ctx, "window") },
      {
        description: "two moving index variables (left/right or start/end)",
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "left", "right") || hasKeyword(ctx, "start", "end"),
      },
      {
        description: "single loop (not nested)",
        weight: 1,
        test: (ctx) => hasLoop(ctx) && !hasNestedLoop(ctx),
      },
    ],
  },
  {
    algorithm: "greedy",
    minSignalsRequired: 2,
    signals: [
      { description: '"greedy" keyword', weight: 3, test: (ctx) => hasKeyword(ctx, "greedy") },
      {
        description: "sort followed by an iterative pass",
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "sort") && hasLoop(ctx),
      },
    ],
  },
  {
    algorithm: "dynamic-programming",
    minSignalsRequired: 2,
    signals: [
      {
        description: '"dp"/"memo"/"cache" naming',
        weight: 3,
        test: (ctx) => hasKeyword(ctx, "dp", "memo", "memoization", "cache"),
      },
      {
        description: "recursion with memoization or a nested-loop table build",
        weight: 2,
        test: (ctx) =>
          (hasRecursion(ctx) && hasKeyword(ctx, "memo", "cache")) || hasNestedLoop(ctx, 2),
      },
      {
        description: "2D table indexing pattern",
        weight: 1,
        test: (ctx) => hasPattern(ctx, /\[\s*[a-z_]\w*\s*\]\s*\[\s*[a-z_]\w*\s*\]/i),
      },
    ],
  },
  {
    algorithm: "backtracking",
    minSignalsRequired: 2,
    signals: [
      {
        description: '"backtrack" keyword',
        weight: 3,
        test: (ctx) => hasKeyword(ctx, "backtrack"),
      },
      { description: "recursion", weight: 2, test: hasRecursion },
      {
        description: "add-then-undo state pattern (push/pop, append/remove, or add/remove)",
        weight: 2,
        test: (ctx) =>
          (hasKeyword(ctx, "push") && hasKeyword(ctx, "pop")) ||
          (hasKeyword(ctx, "append") && hasKeyword(ctx, "remove")) ||
          (hasKeyword(ctx, "add") && hasKeyword(ctx, "remove")),
      },
    ],
  },
  {
    algorithm: "hashmap",
    minSignalsRequired: 1,
    signals: [
      {
        description: "hash map / dictionary construct",
        weight: 3,
        test: (ctx) =>
          hasKeyword(ctx, "hashmap", "unordered_map", "dict", "dictionary") ||
          hasPattern(ctx, /new\s+Map\s*\(/),
      },
      { description: '"hash" keyword', weight: 1, test: (ctx) => hasKeyword(ctx, "hash") },
    ],
  },
  {
    algorithm: "two-pointer",
    minSignalsRequired: 2,
    signals: [
      {
        description: "two named index variables (left/right or start/end or i/j)",
        weight: 2,
        test: (ctx) => hasKeyword(ctx, "left", "right") || hasKeyword(ctx, "start", "end"),
      },
      { description: '"pointer" keyword', weight: 1, test: (ctx) => hasKeyword(ctx, "pointer") },
      {
        description: "single loop (not nested)",
        weight: 2,
        test: (ctx) => hasLoop(ctx) && !hasNestedLoop(ctx),
      },
    ],
  },
];
