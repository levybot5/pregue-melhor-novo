// Camada de geração por IA. Ainda não implementada.
//
// Regras para quando for implementada:
// - Toda chamada acontece no backend (Route Handler / Server Action),
//   nunca no cliente. Nenhuma chave de API é exposta ao frontend.
// - 1 ação explícita do usuário = no máximo 1 chamada de geração.
//   Nunca chamar IA em load, useEffect, navegação, refresh, autosave,
//   biblioteca, PDF, copiar ou abrir conteúdo salvo.
// - O provedor concreto (OpenAI, Anthropic, Gemini) implementa a
//   interface AiClient definida em ./types, permitindo trocar de
//   provedor sem alterar quem consome este serviço.

export type { AiClient, AiProvider, GenerationRequest, GenerationResult } from "./types";
