import { NextResponse, type NextRequest } from "next/server";
import { sendRenewalReminders } from "@/services/email/renewal-reminder";

export const maxDuration = 60;

// Disparado 1x/dia pelo cron da Vercel (ver vercel.json). A Vercel
// injeta "Authorization: Bearer <CRON_SECRET>" sozinha quando o
// projeto tem CRON_SECRET configurado — comparação em tempo constante
// não é necessária aqui (não é um segredo de terceiro, é nosso próprio
// gatilho interno), mas ainda assim precisa bater pra rejeitar chamadas
// externas na rota.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendRenewalReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[RENEWAL-REMINDER] falha no cron:", error);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
