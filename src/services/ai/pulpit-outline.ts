import { z } from "zod";

// Formato ANTIGO da ferramenta hoje chamada "Pregação para Esboço"
// (antes "Esboço para Púlpito", gerava um roteiro a partir de
// tema/passagem). Mantido só para ler conteúdo já salvo na Biblioteca
// — a geração nova usa ./sermon-outline.ts. Não gerar mais conteúdo
// neste formato.

const pulpitPointSchema = z.object({
  titulo: z.string().min(1),
  texto_relacionado: z
    .string()
    .min(1)
    .describe("Texto ou referência bíblica relacionada a este ponto"),
  bullets: z
    .array(z.string().min(1))
    .length(3)
    .describe("Exatamente três marcadores curtos e escaneáveis"),
  frase_impacto: z
    .string()
    .min(1)
    .describe("Uma frase curta e marcante para dizer em voz alta neste ponto"),
});

export const pulpitOutlineContentSchema = z.object({
  tema: z.string().min(1),
  texto_base: z.string().min(1),
  ideia_central: z.string().min(1),
  introducao: z
    .array(z.string().min(1))
    .min(1)
    .max(3)
    .describe("Até 3 marcadores curtos de introdução"),
  pontos: z
    .array(pulpitPointSchema)
    .length(3)
    .describe("Exatamente três pontos, cada um com bullets e frase de impacto"),
  aplicacao_final: z
    .array(z.string().min(1))
    .min(1)
    .max(3)
    .describe("Até 3 marcadores de aplicação final"),
  apelo: z.string().min(1).describe("Curto e direto"),
  oracao: z.string().min(1).describe("Curta"),
});

export type PulpitOutlineContent = z.infer<typeof pulpitOutlineContentSchema>;
