// Service worker mínimo: apenas habilita a instalação do PWA.
// Nenhuma estratégia de cache é aplicada — todas as requisições
// (páginas e APIs) seguem direto para a rede.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sem cache: mantém o app sempre servindo a versão mais recente.
});
