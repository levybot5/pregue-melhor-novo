import Link from "next/link";

export const metadata = {
  title: "Pregue Melhor — ferramenta para preparar pregações e estudos bíblicos",
  description:
    "Pregue Melhor é um aplicativo web para pastores, pregadores e professores de escola bíblica prepararem pregações, esboços, comentários bíblicos e aulas.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function SobrePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-7 px-4 pb-12 pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pregue Melhor</h1>
        <p className="text-base text-muted">
          Aplicativo web para pastores, pregadores e professores de escola bíblica prepararem
          pregações e estudos bíblicos com mais rapidez.
        </p>
      </header>

      <Section title="O que é o Pregue Melhor">
        <p>
          O Pregue Melhor ajuda quem prega e ensina a Bíblia a preparar a mensagem da semana. A
          pessoa digita uma passagem bíblica ou um tema, e o aplicativo monta o material para ela
          revisar, editar e usar.
        </p>
      </Section>

      <Section title="O que você encontra no aplicativo">
        <ul className="list-disc pl-5">
          <li>Criador de pregações completas, com introdução, pontos, versículos de apoio e aplicação</li>
          <li>Esboços de pregação para levar ao púlpito, com exportação em PDF</li>
          <li>Comentário bíblico, dicionário bíblico e aulas bíblicas</li>
          <li>Biblioteca de esboços e pregações prontas</li>
          <li>Bíblia para leitura, com grifos e anotações pessoais</li>
        </ul>
      </Section>

      <Section title="Login com Google">
        <p>
          Você pode criar sua conta ou entrar com e-mail e senha, ou com a sua Conta do Google.
          Usamos o login do Google somente para autenticação: recebemos o seu nome e o seu
          endereço de e-mail para identificar a sua conta no Pregue Melhor.
        </p>
        <p>
          Não acessamos seus e-mails, contatos, arquivos nem qualquer outro dado da sua Conta do
          Google, e não compartilhamos essas informações com terceiros nem as usamos para
          publicidade. Mais detalhes na{" "}
          <Link href="/privacidade" className="text-foreground underline underline-offset-4">
            Política de Privacidade
          </Link>
          .
        </p>
      </Section>

      <nav className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/cadastrar"
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
        >
          Criar conta
        </Link>
        <Link
          href="/entrar"
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-card-border px-5 font-semibold text-foreground"
        >
          Entrar
        </Link>
      </nav>

      <footer className="flex flex-col gap-1 border-t border-card-border pt-5 text-sm text-muted">
        <Link href="/privacidade" className="underline underline-offset-4">
          Política de Privacidade
        </Link>
        <p>
          Contato:{" "}
          <a href="mailto:contato@preguemelhorapp.site" className="underline underline-offset-4">
            contato@preguemelhorapp.site
          </a>
        </p>
      </footer>
    </main>
  );
}
