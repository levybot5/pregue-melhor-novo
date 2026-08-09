"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalação como PWA fica indisponível, mas o app continua
        // funcionando normalmente pelo navegador.
      });
    }
  }, []);

  return null;
}
