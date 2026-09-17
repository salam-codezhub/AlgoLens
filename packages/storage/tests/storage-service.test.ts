import { describe, expect, it } from "vitest";
import { createDatabase, StorageService } from "../src/index.js";

describe("StorageService", () => {
  it("persists and retrieves records", () => {
    const database = createDatabase({ databasePath: ":memory:" });
    const storage = new StorageService(database);

    const saved = storage.save("history", "test", "Phase 38");

    expect(saved.type).toBe("history");
    expect(storage.get("history", "test")?.value).toBe("Phase 38");

    storage.close();
  });
});
