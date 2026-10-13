import "server-only";
import { getSupabaseAdminClient } from "@/services/database/admin-client";
import { getResendClient, RESEND_FROM, RESEND_REPLY_TO } from "./resend-client";

function renderHtml(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2933;">
      <h1 style="font-size: 20px;">Redefinir sua senha</h1>
      <p>Recebemos um pedido para redefinir a senha da sua conta no Pregue Melhor. Toque no botão abaixo para escolher uma nova senha.</p>
      <p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #2f6f4f; color: #fff; padding: 12px 24px;
                  border-radius: 12px; text-decoration: none; font-weight: 600;">
          Criar nova senha
        </a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">
        O link tem validade curta e só funciona uma vez. Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.
      </p>
      <p style="font-size: 12px; color: #6b7280;">
        Equipe Pregue Melhor<br />
        Dúvidas? É só responder este e-mail.
      </p>
    </div>
  `;
}

function renderText(resetUrl: string): string {
  return `Redefinir sua senha\n\nRecebemos um pedido para redefinir a senha da sua conta no Pregue Melhor. Abra o link abaixo para escolher uma nova senha:\n\n${resetUrl}\n\nO link tem validade curta e só funciona uma vez. Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.\n\nEquipe Pregue Melhor\nDúvidas? É só responder este e-mail.`;
}

// Gera o token de recuperação pelo admin e manda o e-mail pelo Resend,
// em vez do template do painel do Supabase: o link aponta direto pra
// /redefinir-senha?token_hash=... e a página só consome o token quando
// a pessoa envia a senha nova (ver updatePasswordAction). Assim não
// depende de cookie do mesmo navegador (Gmail/Instagram abrem o link
// num navegador embutido) nem é "gasto" por antivírus/pré-visualização
// de link que abrem a URL antes da pessoa. Retorna false se não houver
// conta pra esse e-mail — quem chama não deve revelar isso.
export async function sendPasswordResetEmail(email: string, siteUrl: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });

  if (error || !data?.properties?.hashed_token) return false;

  const resetUrl = `${siteUrl}/redefinir-senha?token_hash=${encodeURIComponent(data.properties.hashed_token)}`;

  const { error: sendError } = await getResendClient().emails.send({
    from: RESEND_FROM,
    replyTo: RESEND_REPLY_TO,
    to: email,
    subject: "Redefinir sua senha do Pregue Melhor",
    html: renderHtml(resetUrl),
    text: renderText(resetUrl),
  });

  if (sendError) throw new Error(`Resend: ${sendError.message}`);
  return true;
}
