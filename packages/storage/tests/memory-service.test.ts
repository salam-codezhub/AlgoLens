import { describe, expect, it } from "vitest";
import { createDatabase, MemoryService, StorageService } from "../src/index.js";

describe("MemoryService", () => {
  it("remembers and recalls entries", () => {
    const database = createDatabase({ databasePath: ":memory:" });
    const storage = new StorageService(database);
    const memory = new MemoryService(storage);

    memory.remember("preferred-language", "TypeScript");

    expect(memory.recall("preferred-language")?.content).toBe("TypeScript");
    expect(memory.list()).toHaveLength(1);

    memory.forget("preferred-language");

    expect(memory.recall("preferred-language")).toBeUndefined();

    storage.close();
  });
});
