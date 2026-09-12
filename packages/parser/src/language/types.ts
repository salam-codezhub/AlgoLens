/** The six languages MASTER_02_PHASES.md's Phase 19 requires support for. */
export type SupportedLanguage = "c" | "cpp" | "java" | "python" | "javascript" | "typescript";

export type DetectionMethod =
  "extension" | "vscodeLanguageId" | "shebang" | "heuristic" | "unknown";

export interface LanguageDetectionResult {
  readonly language: SupportedLanguage | "unknown";
  /** 0-100. Matches the Confidence Score scale used elsewhere in the
   *  project (MASTER_05_AI_RULES.md) so results compose naturally with
   *  the rest of the analysis pipeline. */
  readonly confidence: number;
  readonly method: DetectionMethod;
}

export interface DetectionInput {
  /** File path or name — even without the file existing on disk, the
   *  extension alone is often enough. */
  readonly filePath?: string;
  /** File contents, used for shebang/heuristic detection when the
   *  extension is missing, unrecognized, or ambiguous (e.g. distinguishing
   *  JavaScript from TypeScript when both use a generic ".js"-less name). */
  readonly content?: string;
  /** VS Code's own `document.languageId`, when detection runs inside the
   *  extension host and an editor is already open — the strongest single
   *  signal available, since VS Code has its own detection plus whatever
   *  the user explicitly set via the language picker. */
  readonly vscodeLanguageId?: string;
}
