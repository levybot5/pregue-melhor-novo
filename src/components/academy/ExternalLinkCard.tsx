type ExternalLinkCardProps = {
  eyebrow?: string;
  title: string;
  url: string;
  cta: string;
};

// Link externo (YouTube avulso, PDF no Drive etc.) — usado tanto pelo
// curso "Pregação Sem Enrolação" quanto pelos materiais em PDF, os dois
// vindos da antiga página "Apoio do Pregador".
export function ExternalLinkCard({ eyebrow, title, url, cta }: ExternalLinkCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-colors active:bg-card-active"
    >
      <span className="min-w-0 flex-1">
        {eyebrow && <span className="block text-xs font-medium text-muted">{eyebrow}</span>}
        <span className="block text-base font-semibold text-foreground">{title}</span>
      </span>
      <span className="flex min-h-[40px] shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
        {cta}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}
