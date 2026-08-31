import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import { RevealOnScroll } from "./RevealOnScroll";
import { AutoplayVideos } from "./AutoplayVideos";
import { TestimonialDots } from "./TestimonialDots";

// Página de oferta pública, movida do Artifact avulso pra dentro do app —
// mesma origem do checkout, sem as limitações de CSP do Artifact (bloqueio
// de iframe/imagem externa e de upload de asset). O CSS e o corpo ficam em
// arquivos .css/.html co-localizados (content.css/content.html) só pra
// manter a edição igual ao que já estávamos fazendo, não por padrão do
// Next — é a página inteira, então dangerouslySetInnerHTML aqui é seguro
// (conteúdo 100% autoral nosso, nunca dado de usuário).
export const metadata: Metadata = {
  title: "Pregue Melhor — Prepare sua pregação em minutos",
  description: "Página de oferta do Pregue Melhor, o app de preparação de pregação com IA.",
};

export default function OfertaPage() {
  const css = readFileSync(join(process.cwd(), "src/app/oferta/content.css"), "utf8");
  const body = readFileSync(join(process.cwd(), "src/app/oferta/content.html"), "utf8");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <RevealOnScroll />
      <AutoplayVideos />
      <TestimonialDots />
    </>
  );
}
