"use client";

import { useEffect } from "react";

// Sincroniza a bolinha ativa do carrossel de depoimentos com o vídeo que
// está centralizado na tela no momento (scroll-snap já cuida do "encaixe"
// visual; isto só reflete qual encaixou nas bolinhas embaixo).
export function TestimonialDots() {
  useEffect(() => {
    const videos = document.querySelectorAll(".testimonial-video");
    const dots = document.querySelectorAll(".testimonial-dot");
    if (videos.length === 0 || videos.length !== dots.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = [...videos].indexOf(entry.target as Element);
          dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
        });
      },
      { threshold: 0.6 },
    );
    videos.forEach((video) => io.observe(video));

    return () => io.disconnect();
  }, []);

  return null;
}
