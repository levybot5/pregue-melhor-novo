import { readFileSync } from "fs";
import { join } from "path";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";

// Hospedada localmente (mesmo padrão do Geist em layout.tsx) em vez do
// <link> pro Google Fonts — tira uma requisição que bloqueava a
// renderização (~190ms apontados pelo PageSpeed) e um round-trip a mais
// pra fonts.googleapis.com/fonts.gstatic.com. Só os pesos usados de
// verdade no content.css (400/600/700/800/900, sem 500 nem itálico).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// Os 4 componentes abaixo não renderizam nada (só ligam comportamento:
// animação de entrada, autoplay, carrossel, facade do YouTube) — carregar
// o JS deles em separado do bundle principal tira trabalho do main
// thread bem na janela crítica do LCP (PageSpeed apontava 2,1s de
// "atraso na renderização" do elemento LCP, a miniatura do hero — nada
// de rede, era o thread ocupado). Sem "ssr: false" (não é permitido em
// next/dynamic dentro de Server Component) — como os 4 só usam
// useEffect, não roda nada no server de qualquer forma.
const RevealOnScroll = dynamic(() => import("./RevealOnScroll").then((m) => m.RevealOnScroll));
const AutoplayVideos = dynamic(() => import("./AutoplayVideos").then((m) => m.AutoplayVideos));
const TestimonialDots = dynamic(() => import("./TestimonialDots").then((m) => m.TestimonialDots));
const YoutubeFacade = dynamic(() => import("./YoutubeFacade").then((m) => m.YoutubeFacade));

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
    <div className={`oferta-page ${poppins.variable}`}>
      <style>{css}</style>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <RevealOnScroll />
      <AutoplayVideos />
      <TestimonialDots />
      <YoutubeFacade />
    </div>
  );
}
