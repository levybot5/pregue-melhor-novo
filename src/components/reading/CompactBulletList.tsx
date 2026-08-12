type CompactBulletListProps = {
  items: string[];
};

// Lista de marcadores compacta, com marcador dourado — usada nos
// esboços e nas frases-chave dos pontos.
export function CompactBulletList({ items }: CompactBulletListProps) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-[16px] leading-[1.6] text-foreground">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}
