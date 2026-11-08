import Script from "next/script";

/** Public Meta (Facebook) Pixel ID — visible in page HTML by design. Override with NEXT_PUBLIC_META_PIXEL_ID. */
const DEFAULT_PIXEL_ID = "1648347186785981";

export function metaPixelId() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || DEFAULT_PIXEL_ID;
  return /^\d{6,20}$/.test(id) ? id : null;
}

/**
 * Meta Pixel base code + PageView. Events fired by the page before this script
 * runs are parked in `window.__fbqPending` (see lib/analytics) and flushed here.
 */
export function MetaPixel() {
  const pixelId = metaPixelId();
  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
fbq('track','PageView');
(window.__fbqPending||[]).forEach(function(a){fbq.apply(null,a)});window.__fbqPending=[];`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
