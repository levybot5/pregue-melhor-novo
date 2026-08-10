import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getGenerationStatus } from "@/services/billing";
import { GenerationBlockedNotice } from "@/components/GenerationBlockedNotice";
import { EsbocoPregacaoForm } from "./Form";

export default async function EsbocoPregacaoPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?redirectTo=/esboco-pregacao");
  }

  const status = await getGenerationStatus(user.id);

  if (!status.subscriptionActive) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
        <GenerationBlockedNotice
          message="Seu acesso ao Pregue Melhor Pro não está ativo."
          variant="inactive"
        />
      </main>
    );
  }

  return <EsbocoPregacaoForm initialRemaining={status.dailyRemaining} />;
}
