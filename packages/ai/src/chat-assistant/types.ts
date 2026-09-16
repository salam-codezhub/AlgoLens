import type { AIProviderId, ChatMessage, StreamChunk } from "../types.js";

export type ChatCapability =
  | "explain-code"
  | "find-bugs"
  | "generate-tests"
  | "suggest-algorithms"
  | "generate-documentation"
  | "improve-naming"
  | "explain-complexity"
  | "programming-question";

export interface ChatAssistantRequest {
  readonly message: string;
  readonly code?: string;
  readonly language?: string;
  readonly filePath?: string;
  readonly capability?: ChatCapability;
}

export interface StructuredChatResponse {
  readonly answer: string;
  readonly capability: ChatCapability | "general";
  readonly provider: AIProviderId;
  readonly model: string;
  readonly confidence: number;
  readonly suggestions: readonly string[];
}

export interface ConversationMessage extends ChatMessage {
  readonly timestamp: number;
}

export interface ConversationState {
  readonly messages: readonly ConversationMessage[];
}

export interface ChatAssistantStream {
  readonly chunks: AsyncIterable<StreamChunk>;
  readonly history: readonly ConversationMessage[];
}
