import "server-only";

// Único arquivo que conhece a URL base e o header de autenticação da
// Asaas. A chave nunca é logada (nem em erro) — se uma chamada falhar,
// logamos só status/endpoint. https://docs.asaas.com/docs/authentication:
// a chave vai no header "access_token" (não é Bearer), nunca em query
// string, nunca NEXT_PUBLIC_.

export class AsaasApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    public readonly body: unknown,
  ) {
    super(`Asaas API respondeu ${status} em ${endpoint}`);
    this.name = "AsaasApiError";
  }
}

function getBaseUrl(): string {
  const environment = process.env.ASAAS_ENVIRONMENT;
  if (environment === "production") return "https://api.asaas.com/v3";
  // "sandbox" ou não definido: nunca aponta para produção por padrão,
  // silenciosamente — isso seria muito perigoso com dinheiro real.
  return "https://api-sandbox.asaas.com/v3";
}

function getApiKey(): string {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("Asaas não configurado: defina ASAAS_API_KEY em .env.local");
  }
  return apiKey;
}

export async function asaasRequest<T>(
  method: "GET" | "POST",
  endpoint: string,
  body?: unknown,
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "PregueMelhor/1.0",
      access_token: getApiKey(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(`[ASAAS] ${method} ${endpoint} -> ${response.status}`);
    throw new AsaasApiError(response.status, endpoint, data);
  }

  return data as T;
}
