import Script from "next/script";

// Pixel base do Meta — só isso já grava os cookies _fbp (toda visita)
// e _fbc (quando a pessoa chega pelo clique de um anúncio, via
// fbclid na URL). São esses dois cookies que a Conversions API lê
// depois, no checkout PIX, pra linkar a venda de volta no anúncio
// certo (ver services/marketing/meta-capi.ts). Sem META_PIXEL_ID
// configurado, não renderiza nada — nunca quebra o app por falta de
// variável de ambiente.
export function MetaPixel() {
  const pixelId = process.env.META_PIXEL_ID;
  if (!pixelId) return null;

  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
