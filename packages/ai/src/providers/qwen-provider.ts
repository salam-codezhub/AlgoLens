import { OpenAICompatibleProvider } from "./openai-compatible-provider.js";

/** Verified against Alibaba Cloud Model Studio's own docs: Qwen models are
 *  reachable through DashScope's OpenAI-compatible endpoint. This is the
 *  international base URL; mainland-China deployments use a different
 *  regional endpoint, configurable via AIProviderConfig.baseURL. */
const QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

export class QwenProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, defaultModel = "qwen-plus") {
    super({ id: "qwen", apiKey, baseURL: QWEN_BASE_URL, defaultModel });
  }
}
