import { AIProviderError } from "@algolens/ai";
import type { AIContext, AIProvider, AIProviderConfig, AIResponse } from "@algolens/ai";
import { createProvider } from "@algolens/ai";

export const AI_PROVIDER_SECRET_PREFIX = "algolens.ai.apiKey.";
const SUPPORTED_PROVIDERS = ["openai", "claude", "gemini", "deepseek", "qwen"] as const;

export type ConfiguredProvider = (typeof SUPPORTED_PROVIDERS)[number];

export interface ExplainInput {
  readonly code: string;
  readonly language: string;
  readonly filePath: string;
}

export function selectCode(selection: string, documentText: string): string {
  return selection.trim().length > 0 ? selection : documentText;
}

export function isConfiguredProvider(value: unknown): value is ConfiguredProvider {
  return typeof value === "string" && SUPPORTED_PROVIDERS.some((provider) => provider === value);
}

export function formatExplanationReport(
  input: ExplainInput,
  response: Pick<AIResponse, "content" | "provider" | "model">
): string {
  const safeFilePath = input.filePath
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");

  return [
    "# AlgoLens Code Explanation",
    "",
    `- **File:** \`${safeFilePath}\``,
    `- **Language:** ${input.language}`,
    `- **Provider:** ${response.provider}`,
    `- **Model:** ${response.model}`,
    "",
    response.content.trim(),
    "",
  ].join("\n");
}
export async function explainWithProvider(
  config: AIProviderConfig,
  input: ExplainInput,
  providerFactory: (config: AIProviderConfig) => AIProvider = createProvider
): Promise<AIResponse> {
  const provider = providerFactory(config);
  const context: AIContext = {
    code: input.code,
    language: input.language,
    filePath: input.filePath,
    userRequest:
      "Explain this code clearly. Describe its purpose, key logic, important control flow, and notable edge cases. Do not claim to have executed it.",
  };
  return provider.explain(context);
}

export interface ExplainCommandEditor {
  readonly selection: string;
  readonly documentText: string;
  readonly language: string;
  readonly filePath: string;
}

export type ExplainCommandOutcome =
  | { readonly kind: "no-editor" }
  | { readonly kind: "empty-code" }
  | { readonly kind: "unsupported-provider" }
  | { readonly kind: "cancelled" }
  | {
      readonly kind: "explained";
      readonly input: ExplainInput;
      readonly response: AIResponse;
      readonly provider: ConfiguredProvider;
    }
  | { readonly kind: "empty-response" }
  | {
      readonly kind: "provider-error";
      readonly provider: ConfiguredProvider;
      readonly category:
        "authentication" | "rate-limit" | "invalid-request" | "timeout" | "network" | "unknown";
    }
  | { readonly kind: "dependency-error" };

export interface ExplainCommandDependencies {
  getEditor(): ExplainCommandEditor | undefined;
  getProviderSetting(): unknown;
  getModelSetting(): string | undefined;
  getApiKey(provider: ConfiguredProvider): Promise<string | undefined>;
  requestApiKey(provider: ConfiguredProvider): Promise<string | undefined>;
  storeApiKey(provider: ConfiguredProvider, key: string): Promise<void>;
  confirmRemoteDisclosure(provider: ConfiguredProvider, filePath: string): Promise<boolean>;
  resolveInput(
    editor: ExplainCommandEditor,
    code: string
  ): Pick<ExplainInput, "language" | "filePath">;
  explain(config: AIProviderConfig, input: ExplainInput): Promise<AIResponse>;
  readonly signal?: AbortSignal;
}

export async function runExplainCommand(
  dependencies: ExplainCommandDependencies
): Promise<ExplainCommandOutcome> {
  const editor = dependencies.getEditor();
  if (!editor) return { kind: "no-editor" };
  const code = selectCode(editor.selection, editor.documentText);
  if (!code.trim()) return { kind: "empty-code" };
  const providerValue = dependencies.getProviderSetting() ?? "openai";
  if (!isConfiguredProvider(providerValue)) return { kind: "unsupported-provider" };
  let apiKey: string | undefined;
  try {
    apiKey = await dependencies.getApiKey(providerValue);
  } catch {
    return { kind: "dependency-error" };
  }
  if (!apiKey) {
    let enteredKey: string | undefined;
    try {
      enteredKey = await dependencies.requestApiKey(providerValue);
    } catch {
      return { kind: "dependency-error" };
    }
    if (!enteredKey?.trim()) return { kind: "cancelled" };
    apiKey = enteredKey.trim();
    try {
      await dependencies.storeApiKey(providerValue, apiKey);
    } catch {
      return { kind: "dependency-error" };
    }
  }
  let resolved: Pick<ExplainInput, "language" | "filePath">;
  try {
    resolved = dependencies.resolveInput(editor, code);
  } catch {
    return { kind: "dependency-error" };
  }
  const input: ExplainInput = { code, ...resolved };
  let disclosureAccepted: boolean;
  try {
    disclosureAccepted = await dependencies.confirmRemoteDisclosure(providerValue, input.filePath);
  } catch {
    return { kind: "dependency-error" };
  }
  if (!disclosureAccepted) return { kind: "cancelled" };
  if (dependencies.signal?.aborted) return { kind: "cancelled" };
  const model = dependencies.getModelSetting();
  const config: AIProviderConfig = { provider: providerValue, apiKey, ...(model ? { model } : {}) };
  let response: AIResponse;
  const signal = dependencies.signal;
  let abortListener: (() => void) | undefined;
  try {
    const providerPromise = dependencies.explain(config, input);
    if (!signal) {
      response = await providerPromise;
    } else {
      // Cancellation stops awaiting/displaying; the shared provider request itself has no abort API.
      const cancelled = new Promise<never>((_, reject) => {
        abortListener = () => {
          reject(new Error("Operation cancelled"));
        };
        signal.addEventListener("abort", abortListener, { once: true });
        if (signal.aborted) abortListener();
      });
      // Race attaches rejection handling immediately, including for a late rejection after cancellation.
      response = await Promise.race([providerPromise, cancelled]);
    }
  } catch (error) {
    if (signal?.aborted) return { kind: "cancelled" };

    let category:
      | "authentication"
      | "rate-limit"
      | "invalid-request"
      | "invalid-response"
      | "timeout"
      | "network"
      | "unknown" = "unknown";
    if (error instanceof AIProviderError) {
      switch (error.code) {
        case "AUTHENTICATION_FAILED":
          category = "authentication";
          break;
        case "RATE_LIMITED":
          category = "rate-limit";
          break;
        case "TIMEOUT":
          category = "timeout";
          break;
        case "NETWORK_ERROR":
          category = "network";
          break;
        case "INVALID_RESPONSE":
          category = "invalid-response";
          break;
      }
    }

    return { kind: "provider-error", provider: providerValue, category };
  } finally {
    if (signal && abortListener) signal.removeEventListener("abort", abortListener);
  }
  if (!response.content.trim()) return { kind: "empty-response" };
  return { kind: "explained", input, response, provider: providerValue };
}

export interface ExplainOutcomeUi {
  showWarning(message: string): void;
  showError(message: string): void;
  showReport(content: string): Promise<void>;
}

export async function presentExplainOutcome(
  outcome: ExplainCommandOutcome,
  ui: ExplainOutcomeUi
): Promise<void> {
  switch (outcome.kind) {
    case "no-editor":
      ui.showWarning("Open a source file before requesting an AI code explanation.");
      return;
    case "empty-code":
      ui.showWarning("Select code or open a non-empty source file to explain.");
      return;
    case "unsupported-provider":
      ui.showError(
        "Unsupported AlgoLens AI provider. Choose OpenAI, Claude, Gemini, DeepSeek, or Qwen in Settings."
      );
      return;
    case "cancelled":
      return;
    case "empty-response":
      ui.showWarning("The AI provider returned an empty explanation. Please try again.");
      return;
    case "dependency-error":
      ui.showError(
        "AlgoLens could not access the AI configuration or editor context. Check your settings and try again."
      );
      return;
    case "provider-error":
      switch (outcome.category) {
        case "authentication":
          ui.showError(
            `AlgoLens could not authenticate with ${outcome.provider}. Check that the API key is valid and has permission for this provider.`
          );
          return;
        case "rate-limit":
          ui.showError(
            `${outcome.provider} rate limit or quota reached. Wait and retry, or check your provider quota and billing.`
          );
          return;
        case "invalid-request":
          ui.showError(
            `${outcome.provider} rejected the request. Check the configured model name and provider settings.`
          );
          return;
        case "invalid-response":
          ui.showError(
            `${outcome.provider} returned an invalid response. Try again, or check the provider status and model compatibility.`
          );
          return;
        case "timeout":
          ui.showError(
            `The ${outcome.provider} request timed out. Check your connection and try again.`
          );
          return;
        case "network":
          ui.showError(`Could not reach ${outcome.provider}. Check your network and try again.`);
          return;
        default:
          ui.showError(
            `AlgoLens could not get an explanation from ${outcome.provider}. Check the provider, model, and API key in settings.`
          );
          return;
      }
    case "explained":
      await ui.showReport(formatExplanationReport(outcome.input, outcome.response));
      return;
  }
}
