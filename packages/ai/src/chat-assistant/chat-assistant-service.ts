import type { WorkspaceContextService } from "@algolens/core";
import type { AIContext, AIProvider, AIResponse } from "../types.js";
import { ConversationMemory } from "./conversation-memory.js";
import type { ChatAssistantRequest, ChatCapability, StructuredChatResponse } from "./types.js";

const DEFAULT_CAPABILITY: ChatCapability = "programming-question";

function calculateConfidence(response: AIResponse): number {
  return response.content.trim().length > 0 ? 80 : 0;
}

function extractSuggestions(content: string): readonly string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .slice(0, 5);
}

async function executeCapability(
  provider: AIProvider,
  capability: ChatCapability,
  context: AIContext
): Promise<AIResponse> {
  switch (capability) {
    case "find-bugs":
      return provider.analyze(context);
    case "generate-tests":
      return provider.generateTests(context);
    case "suggest-algorithms":
    case "improve-naming":
      return provider.optimize(context);
    case "generate-documentation":
      return provider.document(context);
    case "explain-code":
    case "explain-complexity":
    case "programming-question":
      return provider.explain(context);
  }
}

export class ChatAssistantService {
  private readonly memory: ConversationMemory;

  public constructor(
    private readonly provider: AIProvider,
    private readonly workspaceContextService: WorkspaceContextService,
    memory?: ConversationMemory
  ) {
    this.memory = memory ?? new ConversationMemory();
  }

  public async respond(request: ChatAssistantRequest): Promise<StructuredChatResponse> {
    const capability = request.capability ?? DEFAULT_CAPABILITY;
    const workspaceContext = await this.workspaceContextService.getWorkspaceContext();

    const context: AIContext = {
      code: request.code ?? "",
      userRequest: request.message,
      workspaceContext,
      ...(request.language ? { language: request.language } : {}),
      ...(request.filePath ? { filePath: request.filePath } : {}),
    };

    const response = await executeCapability(this.provider, capability, context);

    this.memory.add({
      role: "user",
      content: request.message,
    });

    this.memory.add({
      role: "assistant",
      content: response.content,
    });

    return {
      answer: response.content,
      capability,
      provider: response.provider,
      model: response.model,
      confidence: calculateConfidence(response),
      suggestions: extractSuggestions(response.content),
    };
  }

  public getMemory(): ConversationMemory {
    return this.memory;
  }
}
