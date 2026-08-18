// Marca usada no topo das telas de autenticação (cadastro, login,
// recuperação de senha) — mesmas cores da marca já usadas no cabeçalho
// da Home (bg-accent/text-accent-foreground), fora do contexto da barra
// colorida, que é específica do shell autenticado.
export function AuthLogo() {
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
        P
      </span>
      <span className="text-base font-bold tracking-tight text-foreground">
        Pregue Melhor
      </span>
    </div>
  );
}
