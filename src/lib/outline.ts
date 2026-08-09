// O modelo às vezes inclui a numeração dentro do próprio título do
// ponto (ex.: "1. Providência"), mas quem numera na interface é o
// componente que renderiza a lista. Sem isso, o resultado ficava
// duplicado: "1. 1. Providência". Remove prefixos como "1.", "1 -",
// "1)" antes de exibir, para qualquer conteúdo (novo ou já salvo).
export function normalizeOutlinePointTitle(title: string): string {
  return title.replace(/^\s*\d+\s*[.\-)]\s*/, "").trim();
}
