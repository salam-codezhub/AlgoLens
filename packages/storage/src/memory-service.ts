import type { StorageRecord } from "./types.js";
import type { StorageService } from "./storage-service.js";

export interface MemoryEntry {
  readonly key: string;
  readonly content: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export class MemoryService {
  public constructor(private readonly storage: StorageService) {}

  public remember(key: string, content: string): MemoryEntry {
    const record = this.storage.save("setting", `memory:${key}`, content);
    return this.toMemoryEntry(record);
  }

  public recall(key: string): MemoryEntry | undefined {
    const record = this.storage.get("setting", `memory:${key}`);
    return record ? this.toMemoryEntry(record) : undefined;
  }

  public list(): MemoryEntry[] {
    return this.storage
      .list("setting")
      .filter((record) => record.key.startsWith("memory:"))
      .map((record) => this.toMemoryEntry(record));
  }

  public forget(key: string): boolean {
    return this.storage.delete("setting", `memory:${key}`);
  }

  private toMemoryEntry(record: StorageRecord): MemoryEntry {
    return {
      key: record.key.slice("memory:".length),
      content: record.value,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
