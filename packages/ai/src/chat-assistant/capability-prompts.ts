import type { PromptCategory } from "../prompts/types.js";
import type { ChatCapability } from "./types.js";

export const CHAT_CAPABILITY_PROMPTS: Readonly<Record<ChatCapability, PromptCategory>> = {
  "explain-code": "chat",
  "find-bugs": "analysis",
  "generate-tests": "testing",
  "suggest-algorithms": "optimization",
  "generate-documentation": "documentation",
  "improve-naming": "refactoring",
  "explain-complexity": "analysis",
  "programming-question": "chat",
};
