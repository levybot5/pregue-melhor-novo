import { BackLink } from "@/components/reading";

export const metadata = {
  title: "Política de Privacidade — Pregue Melhor",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <BackLink href="/" />

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Política de Privacidade
        </h1>
        <p className="text-sm text-muted">Última atualização: 19 de agosto de 2026.</p>
      </header>

      <Section title="Quais dados coletamos">
        <p>
          <strong className="text-foreground">Cadastro:</strong> nome, e-mail e senha. A senha
          nunca é armazenada em texto puro — só um hash irreversível.
        </p>
        <p>
          <strong className="text-foreground">Pagamento:</strong> nome e CPF/CNPJ, enviados
          diretamente ao processador de pagamentos (Asaas) para gerar a cobrança Pix. Não
          armazenamos dado de cartão nem CPF completo em nosso próprio banco.
        </p>
        <p>
          <strong className="text-foreground">Conteúdo gerado:</strong> os textos, temas e
          observações que você digita nas ferramentas, e o conteúdo criado a partir deles,
          salvos na sua Biblioteca.
        </p>
        <p>
          <strong className="text-foreground">Uso do app:</strong> quais ferramentas você usa e
          quando, e um identificador anônimo de dispositivo (cookie) para controlar o teste
          gratuito antes do cadastro.
        </p>
      </Section>

      <Section title="Por que coletamos">
        <p>
          Para criar e manter sua conta, gerar o conteúdo que você pede, processar pagamentos,
          controlar limites de uso, e dar suporte quando você precisa de ajuda.
        </p>
      </Section>

      <Section title="Com quem compartilhamos">
        <p>
          Não vendemos nem alugamos seus dados. Compartilhamos o mínimo necessário com quem nos
          ajuda a operar o Pregue Melhor:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong className="text-foreground">Google (Gemini)</strong> — o texto/tema/passagem
            que você digita é enviado pra gerar o conteúdo da ferramenta.
          </li>
          <li>
            <strong className="text-foreground">Asaas</strong> — processa o pagamento Pix (nome e
            CPF/CNPJ).
          </li>
          <li>
            <strong className="text-foreground">Supabase</strong> — hospeda nosso banco de dados
            e o login.
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> — hospeda o aplicativo.
          </li>
          <li>
            <strong className="text-foreground">Sentry</strong> — nos avisa quando algo quebra no
            app, para corrigir rápido.
          </li>
        </ul>
      </Section>

      <Section title="Seus direitos (LGPD)">
        <p>
          Você pode pedir a qualquer momento para acessar, corrigir ou excluir seus dados.
        </p>
        <p>
          Excluir sua conta você mesmo faz em{" "}
          <strong className="text-foreground">Minha Conta → Excluir minha conta</strong> — é
          permanente e remove seu cadastro, conteúdo salvo e histórico de uso. Para qualquer
          outro pedido, fale com o suporte.
        </p>
      </Section>

      <Section title="Por quanto tempo guardamos">
        <p>
          Enquanto sua conta existir. Ao excluir a conta, os dados pessoais e o conteúdo salvo
          são apagados permanentemente. Registros de pagamento já processados podem ser mantidos
          por obrigação legal/fiscal, mesmo após a exclusão da conta.
        </p>
      </Section>

      <Section title="Contato">
        <p>
          Dúvidas sobre esta política ou sobre seus dados: fale com o{" "}
          <a
            href="https://wa.me/5591982486230?text=Quero%20suporte%20no%20Pregue%20Melhor"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            suporte pelo WhatsApp
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
