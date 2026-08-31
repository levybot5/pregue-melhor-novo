"use client";

import { useEffect } from "react";

// Anima os blocos marcados com a classe .reveal (definida em content.css)
// quando entram na viewport — mesmo comportamento do IntersectionObserver
// que a página tinha como Artifact avulso, agora como um efeito React
// porque um <script> inline não executa quando injetado via
// dangerouslySetInnerHTML (o navegador ignora scripts inseridos assim).
export function RevealOnScroll() {
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    const revealEls = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
