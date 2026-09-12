import { OpenAICompatibleProvider } from "./openai-compatible-provider.js";

/** Verified against DeepSeek's own API docs: OpenAI-compatible endpoint at
 *  this base URL, primary model id "deepseek-chat". */
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, defaultModel = "deepseek-chat") {
    super({ id: "deepseek", apiKey, baseURL: DEEPSEEK_BASE_URL, defaultModel });
  }
}
