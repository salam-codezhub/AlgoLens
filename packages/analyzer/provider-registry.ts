import { ClaudeProvider } from "./providers/claude-provider.js";
import { DeepSeekProvider } from "./providers/deepseek-provider.js";
import { EchoProvider } from "./providers/echo-provider.js";
import { GeminiProvider } from "./providers/gemini-provider.js";
import { OpenAIProvider } from "./providers/openai-provider.js";
import { QwenProvider } from "./providers/qwen-provider.js";
import type { AIProvider, AIProviderConfig, AIProviderId } from "./types.js";

type ProviderBuilder = (config: AIProviderConfig) => AIProvider;

/**
 * Maps each {@link AIProviderId} to a builder function. This is the one
 * place that knows about every concrete provider class — everything else
 * in the app goes through {@link createProvider} and only ever sees the
 * {@link AIProvider} interface, satisfying Phase 16's acceptance criterion
 * that no business logic depends on a specific provider.
 */
const REGISTRY: Record<AIProviderId, ProviderBuilder> = {
  openai: (config) => new OpenAIProvider(requireApiKey(config), config.defaultModel),
  claude: (config) => new ClaudeProvider(requireApiKey(config), config.defaultModel),
  gemini: (config) => new GeminiProvider(requireApiKey(config), config.defaultModel),
  deepseek: (config) => new DeepSeekProvider(requireApiKey(config), config.defaultModel),
  qwen: (config) => new QwenProvider(requireApiKey(config), config.defaultModel),
  echo: () => new EchoProvider(),
};

function requireApiKey(config: AIProviderConfig): string {
  if (!config.apiKey) {
    throw new Error(`Provider "${config.provider}" requires an apiKey in its AIProviderConfig.`);
  }
  return config.apiKey;
}

export function getRegisteredProviderIds(): readonly AIProviderId[] {
  return Object.keys(REGISTRY) as AIProviderId[];
}

export function buildProvider(config: AIProviderConfig): AIProvider {
  return REGISTRY[config.provider](config);
}
