import Image from "next/image";

// Marca usada no topo das telas de autenticação (cadastro, login,
// recuperação de senha), fora do contexto da barra colorida, que é
// específica do shell autenticado.
export function AuthLogo() {
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <Image
        src="/brand/icon-source.png"
        alt="Pregue Melhor"
        width={56}
        height={56}
        className="h-14 w-14 rounded-full object-cover"
      />
      <span className="text-base font-bold tracking-tight text-foreground">
        Pregue Melhor
      </span>
    </div>
  );
}
