import type { ChatMessage } from "../types.js";
import type { ConversationMessage, ConversationState } from "./types.js";

export class ConversationMemory {
  private messages: ConversationMessage[] = [];

  public add(message: ChatMessage): ConversationMessage {
    const storedMessage: ConversationMessage = {
      ...message,
      timestamp: Date.now(),
    };

    this.messages.push(storedMessage);

    return storedMessage;
  }

  public getState(): ConversationState {
    return {
      messages: [...this.messages],
    };
  }

  public getMessages(): readonly ConversationMessage[] {
    return [...this.messages];
  }

  public clear(): void {
    this.messages = [];
  }
}
