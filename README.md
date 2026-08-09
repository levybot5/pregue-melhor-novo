# Pregue Melhor

Ferramenta para pregadores cristãos criarem e organizarem materiais para suas mensagens.

Esta é a fundação do projeto: Next.js (App Router) + TypeScript + Tailwind CSS,
mobile-first, preparado como PWA instalável e com estrutura de serviços pronta
para receber Supabase (banco/auth) e IA no futuro.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
  app/            rotas (Home + páginas de cada ferramenta, manifest, ícones)
  components/      componentes de UI reutilizáveis
  services/
    ai/           contrato futuro de geração por IA (sem implementação)
    database/     acesso a dados via Supabase (sem implementação)
    billing/      assinatura e limites de uso (sem implementação)
public/
  sw.js            service worker mínimo (sem cache), só para instalabilidade
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha quando o Supabase for conectado.

## Deploy

Compatível com Vercel ou qualquer host que suporte Next.js.
