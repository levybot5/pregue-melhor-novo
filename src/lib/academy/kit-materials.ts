// Conteúdo do "Kit Pregue com Segurança" (produto avulso, R$9,90,
// acesso permanente — ver src/services/billing/kit.ts). São os mesmos
// 3 materiais em PDF que antes ficavam livres pra qualquer usuário
// logado em /academia ("Materiais em PDF") — nenhum PDF novo, nenhuma
// URL nova, só passaram a exigir o entitlement do Kit pra abrir.
export type KitMaterial = {
  id: string;
  title: string;
  url: string;
};

// Id da seção em /academia — usado pelo redirect de /kit
// (`/academia#${KIT_SECTION_ANCHOR}`) pra levar o comprador direto pro
// lugar certo, sem duplicar conteúdo numa página própria.
export const KIT_SECTION_ANCHOR = "kit-pregue-com-seguranca";

export const KIT_MATERIALS: KitMaterial[] = [
  {
    id: "pregue-com-seguranca",
    title: "Pregue com Segurança",
    url: "https://drive.google.com/file/d/17HQFUQ4yFFpUAoOBOMnMBqVDt5v1NI5P/view?usp=sharing",
  },
  {
    id: "guia-preparar-sermoes",
    title: "Guia Prático Para Preparar seus Sermões",
    url: "https://drive.google.com/file/d/16BhkzurwNBC3ynnaIj8ZLHZgnwfzfVs1/view?usp=sharing",
  },
  {
    id: "como-interpretar-a-biblia",
    title: "Como Interpretar a Bíblia",
    url: "https://drive.google.com/file/d/1dhIwJRtyHn4ETjRa69uHDFPB6tWgqGRC/view?usp=sharing",
  },
];
