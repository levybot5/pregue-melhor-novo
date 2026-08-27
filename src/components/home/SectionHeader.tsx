type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

// Cabeçalho de seção da home — mesmo padrão tipográfico já usado em
// outras listas do app (ex.: "Cursos" na Academia): uppercase,
// tracking largo, tom discreto.
export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
