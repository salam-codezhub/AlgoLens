# packages/ai — AI Provider Layer

Provider-agnostic AI integration layer used by the rest of the system.

Responsible for: AI providers (Claude, OpenAI, Gemini, DeepSeek, Qwen), prompt manager, conversation memory, streaming, token usage tracking, rate limiting, fallback providers.

**Rule:** Business logic must never depend on a specific AI provider — only on this package's interfaces.
