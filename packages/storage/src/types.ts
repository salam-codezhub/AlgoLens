export type StorageRecordType =
  "report" | "benchmark" | "history" | "setting" | "optimization" | "recent-file" | "recent-chat";

export interface StorageRecord {
  readonly id: string;
  readonly type: StorageRecordType;
  readonly key: string;
  readonly value: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface StorageOptions {
  readonly databasePath?: string;
}
