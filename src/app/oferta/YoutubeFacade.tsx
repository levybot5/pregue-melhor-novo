"use client";

import { useEffect } from "react";

// Troca a miniatura clicável (.yt-facade) pelo iframe de verdade do
// YouTube só no clique/toque — carregar os 4 players (1 no hero + 3 nos
// depoimentos) de cara é o que mais pesava a página (Performance 36 /
// LCP 42s no PageSpeed Insights antes disso existir). Sem isso, cada
// visita baixa o player inteiro do YouTube mesmo que ninguém assista.
export function YoutubeFacade() {
  useEffect(() => {
    const facades = document.querySelectorAll<HTMLElement>(".yt-facade");

    function activate(el: HTMLElement) {
      const id = el.dataset.ytId;
      if (!id) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1`;
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

    facades.forEach((el) => {
      const onClick = () => activate(el);
      el.addEventListener("click", onClick);
      el.addEventListener("keydown", onKeydown);
    });
  }, []);

  return null;
}
