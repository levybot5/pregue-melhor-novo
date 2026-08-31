"use client";

import { useEffect } from "react";

// Sincroniza a bolinha ativa do carrossel de depoimentos com o vídeo que
// está centralizado na tela no momento (scroll-snap já cuida do "encaixe"
// visual; isto só reflete qual encaixou nas bolinhas embaixo), e liga as
// setas de navegação pra avançar/voltar um depoimento por clique.
export function TestimonialDots() {
  useEffect(() => {
    const track = document.querySelector<HTMLElement>(".testimonial-track");
    const videos = document.querySelectorAll<HTMLElement>(".testimonial-video");
    const dots = document.querySelectorAll(".testimonial-dot");
    const prevBtn = document.querySelector<HTMLButtonElement>(".testimonial-arrow-prev");
    const nextBtn = document.querySelector<HTMLButtonElement>(".testimonial-arrow-next");
    if (!track || videos.length === 0) return;

    if (videos.length === dots.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = [...videos].indexOf(entry.target as HTMLElement);
            dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
          });
        },
        { threshold: 0.6 },
      );
      videos.forEach((video) => io.observe(video));
    }

    // Avança/volta pelo card mais próximo do centro, não por uma largura
    // fixa — assim funciona igual em qualquer tamanho de tela.
    function scrollByCard(direction: 1 | -1) {
      const trackEl = track as HTMLElement;
      const trackCenter = trackEl.scrollLeft + trackEl.clientWidth / 2;
      const centers = [...videos].map((v) => v.offsetLeft + v.offsetWidth / 2);
      const currentIndex = centers.reduce(
        (closest, center, i) =>
          Math.abs(center - trackCenter) < Math.abs(centers[closest] - trackCenter) ? i : closest,
        0,
      );
      const targetIndex = Math.min(Math.max(currentIndex + direction, 0), videos.length - 1);
      const target = videos[targetIndex];
      trackEl.scrollTo({
        left: target.offsetLeft - (trackEl.clientWidth - target.offsetWidth) / 2,
        behavior: "smooth",
      });
    }

    const onPrev = () => scrollByCard(-1);
    const onNext = () => scrollByCard(1);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, []);

  return null;
}
