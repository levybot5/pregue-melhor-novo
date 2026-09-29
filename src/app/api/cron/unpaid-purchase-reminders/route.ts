import { NextResponse, type NextRequest } from "next/server";
import { sendUnpaidPurchaseReminders } from "@/services/email/unpaid-purchase-reminder";

export const maxDuration = 60;

// Disparado pelo cron da Vercel (ver vercel.json). Mesmo padrão de
// autenticação de /api/cron/renewal-reminders: a Vercel injeta
// "Authorization: Bearer <CRON_SECRET>" sozinha.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendUnpaidPurchaseReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[UNPAID-REMINDER] falha no cron:", error);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
