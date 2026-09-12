import { OpenAICompatibleProvider } from "./openai-compatible-provider.js";

export class OpenAIProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, defaultModel = "gpt-4o") {
    super({ id: "openai", apiKey, defaultModel });
  }
}
