import type { WorkspaceContext } from "@algolens/core";

/** The five AI providers named in MASTER_02_PHASES.md's Phase 16, plus a
 *  local, no-API-key "echo" provider used for testing and offline demos. */
export type AIProviderId = "openai" | "claude" | "gemini" | "deepseek" | "qwen" | "echo";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  readonly role: ChatRole;
  readonly content: string;
}

export interface ChatRequest {
  readonly messages: readonly ChatMessage[];
  /** Overrides the provider's configured default model for this one call. */
  readonly model?: string;
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
}

export interface TokenUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
}

export interface AIResponse {
  readonly content: string;
  readonly model: string;
  readonly provider: AIProviderId;
  readonly usage: TokenUsage;
  /** Wall-clock time the request took, in milliseconds. */
  readonly durationMs: number;
}

/** One incremental piece of a streamed response. */
export interface StreamChunk {
  readonly delta: string;
  /** Set only on the final chunk, once the provider reports it. */
  readonly usage?: TokenUsage;
  readonly done: boolean;
}

/**
 * Minimal context passed to the five task methods (analyze/optimize/...).
 *
 * `workspaceContext` (Phase 18) is optional and additive — callers that
 * don't have a `WorkspaceContextService` available yet (or are running
 * outside VS Code entirely, e.g. in tests) can omit it and every template
 * still renders correctly, just with "(not available yet)" in the
 * workspace-related sections (see prompts/context-builder.ts).
 */
export interface AIContext {
  readonly code: string;
  readonly language?: string;
  readonly filePath?: string;
  readonly userRequest?: string;
  readonly workspaceContext?: WorkspaceContext;
}

/**
 * Provider-independent AI capability, per Phase 16's objective: "AlgoLens
 * should never depend on a single AI provider... The architecture must
 * allow switching between providers without changing business logic."
 *
 * `chat`/`streamChat` are the low-level primitives every provider
 * implements directly. `analyze`/`optimize`/`explain`/`document`/
 * `generateTests` are the task methods named in MASTER_05_AI_RULES.md —
 * {@link BaseAIProvider} implements them generically on top of `chat`, so
 * concrete providers don't each reimplement five near-identical methods.
 * Their prompts are intentionally basic placeholders; the real templates
 * are Phase 17's Prompt Management System's job, applied without changing
 * this interface.
 */
export interface AIProvider {
  readonly id: AIProviderId;

  chat(request: ChatRequest): Promise<AIResponse>;
  streamChat(request: ChatRequest): AsyncIterable<StreamChunk>;

  analyze(context: AIContext): Promise<AIResponse>;
  optimize(context: AIContext): Promise<AIResponse>;
  explain(context: AIContext): Promise<AIResponse>;
  document(context: AIContext): Promise<AIResponse>;
  generateTests(context: AIContext): Promise<AIResponse>;
}

export interface AIProviderConfig {
  readonly provider: AIProviderId;
  readonly apiKey?: string;
  /** Overrides the provider's default base URL — used by DeepSeek/Qwen,
   *  which are OpenAI-API-compatible but hosted at different endpoints. */
  readonly baseURL?: string;
  readonly defaultModel?: string;
  readonly maxRetries?: number;
}
