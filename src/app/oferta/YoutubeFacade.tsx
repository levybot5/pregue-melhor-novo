"use client";

import { useEffect } from "react";

// Troca a miniatura (.yt-facade) pelo iframe de verdade do YouTube só
// quando o bloco entra na tela (autoplay mudo, igual aos vídeos locais
// em .feature-video) — nunca carrega os 4 players de cara, que era o
// que mais pesava a página (Performance 36 / LCP 42s no PageSpeed
// Insights antes disso existir). Clique/toque também ativa na hora,
// como reforço (ex.: leitor de tela sem IntersectionObserver).
export function YoutubeFacade() {
  useEffect(() => {
    const facades = document.querySelectorAll<HTMLElement>(".yt-facade");

    function activate(el: HTMLElement) {
      const id = el.dataset.ytId;
      if (!id) return;
      // mute=1 é obrigatório: navegador só deixa autoplay disparado por
      // scroll (sem gesto do usuário) se o player começar mudo — o
      // player mostra os próprios controles pra quem quiser ativar o som.
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1`;
      iframe.title = el.getAttribute("aria-label") ?? "Vídeo";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.style.position = "absolute";
      iframe.style.inset = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "0";
      el.replaceWith(iframe);
    }

    function onKeydown(event: KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate(event.currentTarget as HTMLElement);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(entry.target as HTMLElement);
        });
      },
      { threshold: 0.5 },
    );

    facades.forEach((el) => {
      const onClick = () => activate(el);
      el.addEventListener("click", onClick);
      el.addEventListener("keydown", onKeydown);
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
