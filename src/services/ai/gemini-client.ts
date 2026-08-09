import "server-only";
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini não configurado: defina GEMINI_API_KEY em .env.local",
    );
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}
