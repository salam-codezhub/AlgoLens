/**
 * The eight prompt categories from MASTER_02_PHASES.md's Phase 17,
 * plus "testing" — added because MASTER_05_AI_RULES.md dedicates a whole
 * section to Test Generation as a first-class AI capability, and
 * {@link AIProvider.generateTests} (Phase 16) needs a template category of
 * its own rather than being forced into an unrelated one.
 */
export type PromptCategory =
  | "analysis"
  | "optimization"
  | "security"
  | "documentation"
  | "benchmark"
  | "runtime"
  | "chat"
  | "refactoring"
  | "testing";

/**
 * Full Context Builder shape, per MASTER_05_AI_RULES.md's "Context
 * Builder" section (Language, File path, AST summary, Imports, Functions,
 * Classes, Dependencies, Complexity summary, Workspace summary, User
 * request). Everything except `code` is optional and mostly unavailable
 * today — the engines that produce them don't exist yet: AST summary
 * needs Phase 20 (AST Parsing), imports/functions/classes need Phase 21
 * (Static Analysis), complexity summary needs Phases 23–24, workspace
 * summary needs Phase 18 (Workspace Context Engine). Templates reference
 * these fields now so later phases only need to *populate* them, not
 * change any template.
 */
export interface PromptContext {
  readonly code: string;
  readonly language?: string;
  readonly filePath?: string;
  readonly astSummary?: string;
  readonly imports?: readonly string[];
  readonly functions?: readonly string[];
  readonly classes?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly complexitySummary?: string;
  readonly workspaceSummary?: string;
  readonly userRequest?: string;
}

export interface PromptTemplate {
  readonly id: string;
  readonly category: PromptCategory;
  /** Semver-ish version string — see prompt-manager.ts's Prompt Versioning docs. */
  readonly version: string;
  readonly description: string;
  /** Rendered once per request as the system message. */
  readonly systemTemplate: string;
  /** Rendered once per request as the user message; may reference
   *  {@link PromptContext} fields as `{{fieldName}}` placeholders. */
  readonly userTemplate: string;
  /** Context fields that must be present (and non-empty) for this
   *  template to render — enforced by Prompt Validation. */
  readonly requiredFields: readonly (keyof PromptContext)[];
}

export interface RenderedPrompt {
  readonly templateId: string;
  readonly category: PromptCategory;
  readonly version: string;
  readonly systemPrompt: string;
  readonly userPrompt: string;
}
