type BaseTextQuoteProps = {
  text: string;
  label?: string;
  compact?: boolean;
};

// Tratamento especial para o Texto Base (e reaproveitado para o
// Versículo para Guardar do Devocional): fundo dourado muito suave,
// borda lateral dourada, referência em azul-marinho. É uma citação
// bíblica elegante, não um alerta — por isso sem ícone de aviso, sem
// sombra pesada. O texto vem exatamente como foi salvo (nunca
// inventamos o versículo).
export function BaseTextQuote({ text, label = "Texto Base", compact }: BaseTextQuoteProps) {
  return (
    <div
      className={`border-l-[3px] border-accent bg-accent-soft/60 ${
        compact ? "px-3 py-2" : "px-4 py-3"
      } rounded-r-xl`}
    >
      <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p
        className={`mt-1 font-medium text-primary ${
          compact ? "text-sm" : "text-base"
        } leading-relaxed`}
      >
        {text}
      </p>
    </div>
  );
}
