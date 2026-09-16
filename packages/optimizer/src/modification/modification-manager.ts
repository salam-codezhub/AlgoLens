import type { ModificationHistoryEntry, ModificationPreview, ModificationState } from "./types.js";

function createId(): string {
  return `mod-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
}

export class ModificationManager {
  private state: ModificationState;

  public constructor(initialCode: string) {
    this.state = {
      currentCode: initialCode,
      history: [],
      historyIndex: -1,
    };
  }

  public getState(): ModificationState {
    return {
      currentCode: this.state.currentCode,
      history: [...this.state.history],
      historyIndex: this.state.historyIndex,
    };
  }

  public accept(preview: ModificationPreview): ModificationHistoryEntry {
    const entry: ModificationHistoryEntry = {
      id: createId(),
      timestamp: Date.now(),
      patch: preview.patch,
      status: "accepted",
    };

    this.state = {
      ...this.state,
      history: [...this.state.history.slice(0, this.state.historyIndex + 1), entry],
      historyIndex: this.state.historyIndex + 1,
    };

    return entry;
  }

  public apply(entryId: string): string {
    const entry = this.state.history.find((item) => item.id === entryId);

    if (entry?.status !== "accepted") {
      throw new Error("Only an accepted modification can be applied.");
    }

    if (this.state.currentCode !== entry.patch.before) {
      throw new Error("Patch no longer matches the current source code.");
    }

    const updatedHistory = this.state.history.map((item) =>
      item.id === entryId ? { ...item, status: "applied" as const } : item
    );

    this.state = {
      ...this.state,
      currentCode: entry.patch.after,
      history: updatedHistory,
    };

    return this.state.currentCode;
  }

  public undo(): string {
    const currentIndex = this.state.historyIndex;

    if (currentIndex < 0) {
      return this.state.currentCode;
    }

    const entry = this.state.history[currentIndex];

    if (!entry) {
      return this.state.currentCode;
    }

    this.state = {
      ...this.state,
      currentCode: entry.patch.before,
      historyIndex: currentIndex - 1,
    };

    return this.state.currentCode;
  }

  public redo(): string {
    const nextIndex = this.state.historyIndex + 1;

    if (nextIndex >= this.state.history.length) {
      return this.state.currentCode;
    }

    const entry = this.state.history[nextIndex];

    if (!entry) {
      return this.state.currentCode;
    }

    this.state = {
      ...this.state,
      currentCode: entry.patch.after,
      historyIndex: nextIndex,
    };

    return this.state.currentCode;
  }

  public rollback(entryId: string): string {
    const entryIndex = this.state.history.findIndex((item) => item.id === entryId);

    if (entryIndex < 0) {
      throw new Error("Modification history entry not found.");
    }

    const previousEntry = entryIndex > 0 ? this.state.history[entryIndex - 1] : undefined;

    const currentCode = previousEntry
      ? previousEntry.patch.after
      : (this.state.history[entryIndex]?.patch.before ?? this.state.currentCode);

    this.state = {
      ...this.state,
      currentCode,
      historyIndex: entryIndex - 1,
    };

    return this.state.currentCode;
  }
}
