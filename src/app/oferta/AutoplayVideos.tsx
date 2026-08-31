"use client";

import { useEffect } from "react";

// Toca cada vídeo de demonstração automaticamente quando o bloco entra na
// tela (e pausa quando sai) — igual ao comportamento do mbiblia. Precisa
// começar mudo: navegador nenhum deixa autoplay com som sem interação do
// usuário; o <video> já tem `controls`, então dá pra ativar o som na mão.
export function AutoplayVideos() {
  useEffect(() => {
    const videos = document.querySelectorAll<HTMLVideoElement>(".feature-video video");
    if (videos.length === 0) return;

    videos.forEach((video) => {
      video.muted = true;
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay recusado (ex.: economia de dados) — sem problema,
              // o vídeo continua com controles pra tocar na mão.
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 },
    );
    videos.forEach((video) => io.observe(video));

    return () => io.disconnect();
  }, []);

  return null;
}
