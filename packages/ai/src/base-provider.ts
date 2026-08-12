import { defaultPromptManager, type PromptManager } from "./prompts/prompt-manager.js";
import type { PromptCategory } from "./prompts/types.js";
import type {
  AIContext,
  AIProvider,
  AIProviderId,
  AIResponse,
  ChatRequest,
  StreamChunk,
} from "./types.js";

/** Maps each Phase 16 task method to the Phase 17 prompt category that
 *  produces its request. "explain" uses the "chat" category — conversational
 *  code explanation is exactly what that category is for — and there's no
 *  dedicated "explanation" category in MASTER_02_PHASES.md's Phase 17 list. */
const TASK_CATEGORY: Record<
  "analyze" | "optimize" | "explain" | "document" | "generateTests",
  PromptCategory
> = {
  analyze: "analysis",
  optimize: "optimization",
  explain: "chat",
  document: "documentation",
  generateTests: "testing",
};

/**
 * Implements the five MASTER_05_AI_RULES.md task methods generically on
 * top of {@link AIProvider.chat}, rendering every request through the
 * Prompt Manager (Phase 17) rather than building prompt strings by hand.
 * Concrete providers extend this and only need to implement
 * `chat`/`streamChat` — the low-level calls to their actual SDK.
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: AIProviderId;

  /** Overridable for tests that need a non-default PromptManager; every
   *  production provider uses the shared default instance. */
  protected readonly promptManager: PromptManager = defaultPromptManager;

  abstract chat(request: ChatRequest): Promise<AIResponse>;
  abstract streamChat(request: ChatRequest): AsyncIterable<StreamChunk>;

  private chatViaPromptManager(category: PromptCategory, context: AIContext): Promise<AIResponse> {
    const rendered = this.promptManager.render(category, context);
    const request: ChatRequest = {
      messages: [
        { role: "system", content: rendered.systemPrompt },
        { role: "user", content: rendered.userPrompt },
      ],
    };
    return this.chat(request);
  }

  analyze(context: AIContext): Promise<AIResponse> {
    return this.chatViaPromptManager(TASK_CATEGORY.analyze, context);
  }

  optimize(context: AIContext): Promise<AIResponse> {
    return this.chatViaPromptManager(TASK_CATEGORY.optimize, context);
  }

  explain(context: AIContext): Promise<AIResponse> {
    const contextWithDefaultRequest: AIContext = {
      ...context,
      userRequest: context.userRequest ?? "Explain what this code does in plain language.",
    };
    return this.chatViaPromptManager(TASK_CATEGORY.explain, contextWithDefaultRequest);
  }

  document(context: AIContext): Promise<AIResponse> {
    return this.chatViaPromptManager(TASK_CATEGORY.document, context);
  }

  generateTests(context: AIContext): Promise<AIResponse> {
    return this.chatViaPromptManager(TASK_CATEGORY.generateTests, context);
  }
}
