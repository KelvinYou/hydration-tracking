import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";

export const alt = `${siteConfig.name} - Daily Water Intake Tracker`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #0c4a6e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Water drop icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.2)",
            marginBottom: 32,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          {siteConfig.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Track your water intake. Build hydration habits. Feel amazing.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["One-Tap Logging", "Hydration Score", "Streak Tracking"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  padding: "10px 24px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
