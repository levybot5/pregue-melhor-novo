"use server";

import { createContent } from "@/services/database";

type ActionResult = { success: true } | { success: false; message: string };

export async function createTestContent(): Promise<ActionResult> {
  try {
    await createContent({
      type: "pregacao",
      title: "O Bom Pastor",
      base_text: "Salmo 23",
      content: {
        introducao: "Conteúdo de teste",
        pontos: ["Ponto 1", "Ponto 2", "Ponto 3"],
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Falha ao salvar conteúdo de teste:", error);
    return { success: false, message: "Não foi possível salvar agora." };
  }
}
