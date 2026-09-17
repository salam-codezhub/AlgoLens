import type Database from "better-sqlite3";
import type { StorageRecord, StorageRecordType } from "./types.js";

export class StorageService {
  public constructor(private readonly database: Database.Database) {}

  public save(type: StorageRecordType, key: string, value: string): StorageRecord {
    const now = Date.now();
    const id = `${type}:${key}`;

    this.database
      .prepare(
        `
        INSERT INTO storage_records (id, type, key, value, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `
      )
      .run(id, type, key, value, now, now);

    const record = this.get(type, key);

    if (!record) {
      throw new Error("Failed to retrieve saved storage record");
    }

    return record;
  }

  public get(type: StorageRecordType, key: string): StorageRecord | undefined {
    return this.database
      .prepare(
        `
        SELECT
          id,
          type,
          key,
          value,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM storage_records
        WHERE type = ? AND key = ?
      `
      )
      .get(type, key) as StorageRecord | undefined;
  }

  public list(type?: StorageRecordType): StorageRecord[] {
    if (type) {
      return this.database
        .prepare(
          `
          SELECT
            id,
            type,
            key,
            value,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM storage_records
          WHERE type = ?
          ORDER BY updated_at DESC
        `
        )
        .all(type) as StorageRecord[];
    }

    return this.database
      .prepare(
        `
        SELECT
          id,
          type,
          key,
          value,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM storage_records
        ORDER BY updated_at DESC
      `
      )
      .all() as StorageRecord[];
  }

  public delete(type: StorageRecordType, key: string): boolean {
    const result = this.database
      .prepare("DELETE FROM storage_records WHERE type = ? AND key = ?")
      .run(type, key);

    return result.changes > 0;
  }

  public close(): void {
    this.database.close();
  }
}
