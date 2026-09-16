export type ModificationStatus = "preview" | "accepted" | "applied" | "undone" | "rolled-back";

export interface CodePatch {
  readonly before: string;
  readonly after: string;
  readonly unifiedDiff: string;
}

export interface ModificationHistoryEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly patch: CodePatch;
  readonly status: ModificationStatus;
}

export interface ModificationPreview {
  readonly patch: CodePatch;
  readonly status: "preview";
  readonly syntaxLanguage?: string;
}

export interface ModificationState {
  readonly currentCode: string;
  readonly history: readonly ModificationHistoryEntry[];
  readonly historyIndex: number;
}
