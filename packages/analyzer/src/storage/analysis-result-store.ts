import type { StaticAnalysisResult } from "../types.js";

/**
 * Stores the latest {@link StaticAnalysisResult} per file, keyed by
 * `filePath` — the actual "Analysis results stored" acceptance criterion,
 * satisfied concretely now, in-memory. Real durable persistence (surviving
 * a VS Code restart, queryable history across sessions) is Phase 36's
 * (Local Database & History) job, backed by SQLite per
 * MASTER_03_ARCHITECTURE.md — this store's interface doesn't need to
 * change when that lands, only its backing implementation does.
 */
export class AnalysisResultStore {
  private readonly results = new Map<string, StaticAnalysisResult>();

  store(result: StaticAnalysisResult): void {
    this.results.set(result.filePath, result);
  }

  get(filePath: string): StaticAnalysisResult | undefined {
    return this.results.get(filePath);
  }

  has(filePath: string): boolean {
    return this.results.has(filePath);
  }

  getAll(): readonly StaticAnalysisResult[] {
    return [...this.results.values()];
  }

  delete(filePath: string): boolean {
    return this.results.delete(filePath);
  }

  clear(): void {
    this.results.clear();
  }

  get size(): number {
    return this.results.size;
  }
}

/** Shared default instance — most callers don't need their own store. */
export const defaultAnalysisResultStore = new AnalysisResultStore();
