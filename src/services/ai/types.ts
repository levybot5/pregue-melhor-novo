// Contrato futuro para chamadas de IA. Nenhuma implementação ou
// chamada de rede acontece nesta etapa — apenas o formato que todo
// provedor (OpenAI, Anthropic, Gemini, etc.) deverá seguir, para que
// trocar de provedor no backend não exija mudanças no restante do app.

export type AiProvider = "openai" | "anthropic" | "google";

export interface GenerationRequest {
  prompt: string;
}

export interface GenerationResult {
  content: string;
}

export interface AiClient {
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
