import type {
  AIContext,
  AIProvider,
  AIProviderId,
  AIResponse,
  ChatRequest,
  StreamChunk,
} from "./types.js";

type TaskKind = "analyze" | "optimize" | "explain" | "document" | "generateTests";

/**
 * Basic, honest placeholder prompts for each task. These are intentionally
 * simple — the real templates (with the full Context Builder fields from
 * MASTER_05_AI_RULES.md) are Phase 17's Prompt Management System. Concrete
 * providers never need to know this placeholder exists; it's applied once,
 * here, so every provider's analyze/optimize/... behaves consistently.
 */
const TASK_INSTRUCTIONS: Record<TaskKind, string> = {
  analyze:
    "Analyze the following code and summarize what it does, its structure, and any concerns.",
  optimize:
    "Suggest optimizations for the following code. Explain trade-offs and preserve behavior.",
  explain: "Explain what the following code does in clear, plain language.",
  document:
    "Generate documentation (function/class docs and a module summary) for the following code.",
  generateTests:
    "Generate test cases (happy path, edge cases, invalid input) for the following code.",
};

function buildTaskRequest(kind: TaskKind, context: AIContext): ChatRequest {
  const parts = [TASK_INSTRUCTIONS[kind]];
  if (context.language) {
    parts.push(`Language: ${context.language}`);
  }
  if (context.filePath) {
    parts.push(`File: ${context.filePath}`);
  }
  if (context.userRequest) {
    parts.push(`Additional request: ${context.userRequest}`);
  }
  parts.push("```", context.code, "```");

  return {
    messages: [{ role: "user", content: parts.join("\n\n") }],
  };
}

/**
 * Implements the five MASTER_05_AI_RULES.md task methods generically on
 * top of {@link AIProvider.chat}. Concrete providers extend this and only
 * need to implement `chat`/`streamChat` — the low-level calls to their
 * actual SDK.
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: AIProviderId;

  abstract chat(request: ChatRequest): Promise<AIResponse>;
  abstract streamChat(request: ChatRequest): AsyncIterable<StreamChunk>;

  analyze(context: AIContext): Promise<AIResponse> {
    return this.chat(buildTaskRequest("analyze", context));
  }

  optimize(context: AIContext): Promise<AIResponse> {
    return this.chat(buildTaskRequest("optimize", context));
  }

  explain(context: AIContext): Promise<AIResponse> {
    return this.chat(buildTaskRequest("explain", context));
  }

  document(context: AIContext): Promise<AIResponse> {
    return this.chat(buildTaskRequest("document", context));
  }

  generateTests(context: AIContext): Promise<AIResponse> {
    return this.chat(buildTaskRequest("generateTests", context));
  }
}
