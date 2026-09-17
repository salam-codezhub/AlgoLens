import Database from "better-sqlite3";
import type { StorageOptions } from "./types.js";

const DEFAULT_DATABASE_PATH = ".algolens/history.db";

export function createDatabase(options: StorageOptions = {}): Database.Database {
  const database = new Database(options.databasePath ?? DEFAULT_DATABASE_PATH);

  database.pragma("journal_mode = WAL");

  database.exec(`
    CREATE TABLE IF NOT EXISTS storage_records (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_storage_records_type
      ON storage_records(type);

    CREATE INDEX IF NOT EXISTS idx_storage_records_key
      ON storage_records(key);
  `);

  return database;
}
