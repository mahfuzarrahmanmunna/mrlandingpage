import { ImageResponse } from "next/og";

export const alt = "MR Imperial — luxury watches";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Typographic brand card. Product SEO images can be set per product in admin (seo.ogImage). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #fbf9f4 0%, #f1eadf 60%, #e4d9c6 100%)",
          color: "#17140f",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, color: "#7a5a2b" }}>MR IMPERIAL</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 108, lineHeight: 1 }}>Time, quietly</div>
          <div style={{ fontSize: 108, lineHeight: 1, fontStyle: "italic", color: "#4a443b" }}>well kept.</div>
        </div>
        <div style={{ display: "flex", height: 2, width: 220, background: "#b8955c" }} />
      </div>
    ),
    size,
  );
}
