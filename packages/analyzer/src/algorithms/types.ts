import type { StaticAnalysisResult } from "../types.js";

/** The fourteen algorithms MASTER_02_PHASES.md's Phase 22 requires support for. */
export type AlgorithmType =
  | "binary-search"
  | "merge-sort"
  | "quick-sort"
  | "bubble-sort"
  | "dfs"
  | "bfs"
  | "trie"
  | "heap"
  | "sliding-window"
  | "greedy"
  | "dynamic-programming"
  | "backtracking"
  | "hashmap"
  | "two-pointer";

export interface AlgorithmMatch {
  readonly algorithm: AlgorithmType;
  /** 0-100, per the project's standard Confidence Score scale
   *  (MASTER_05_AI_RULES.md): 90-100 verified, 70-89 strong evidence,
   *  50-69 needs review, below 50 hypothesis. Never claims verified-level
   *  confidence — see detector-engine.ts's module doc for why. */
  readonly confidence: number;
  /** Which signals contributed, and their individual weight — kept for
   *  transparency: a caller (or a human reviewing a result) can see
   *  exactly why a match was made, not just a bare number. */
  readonly matchedSignals: readonly string[];
}

/** Everything a signal predicate might need to check for. Deliberately
 *  whole-file-scoped rather than per-function: attributing each matched
 *  pattern to a specific function would need source-range positions that
 *  Phase 20's AstSummary doesn't carry (it exposes function names, not
 *  their text ranges) — extending that is a reasonable future refinement,
 *  not required by this phase's literal acceptance criterion ("Algorithm
 *  identified with confidence score", not "...attributed to a function"). */
export interface AlgorithmDetectionContext {
  readonly code: string;
  readonly normalizedCode: string;
  readonly analysis: StaticAnalysisResult;
}
