"use client";
import { useId } from "react";

interface Props {
  size?: number;
  iconOnly?: boolean;
}

export default function SecurePassLogo({ size = 40, iconOnly = false }: Props) {
  const id = useId().replace(/:/g, "");

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        {/* Rounded square bg */}
        <rect width="40" height="40" rx="10" fill={`url(#${id}-grad)`} />
        {/* Shield shape */}
        <path d="M20 8 L30 12 L30 22 C30 27.5 25.5 32 20 33 C14.5 32 10 27.5 10 22 L10 12 Z"
          fill="rgba(255,255,255,0.18)" />
        <path d="M20 10 L28 13.5 L28 22 C28 26.5 24.5 30.5 20 31.5 C15.5 30.5 12 26.5 12 22 L12 13.5 Z"
          fill="white" />
        {/* Lock body */}
        <rect x="15.5" y="20" width="9" height="7" rx="1.5" fill="#059669" />
        {/* Lock shackle */}
        <path d="M17 20 L17 17.5 C17 15.5 23 15.5 23 17.5 L23 20"
          stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Keyhole */}
        <circle cx="20" cy="23" r="1.2" fill="white" />
        <rect x="19.3" y="23.8" width="1.4" height="2" rx="0.5" fill="white" />
      </svg>

      {!iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{
            fontSize: size * 0.48,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#059669",
          }}>
            Secure<span style={{ color: "#0d9488" }}>Pass</span>
          </span>
          <span style={{
            fontSize: size * 0.22,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#94a3b8",
            textTransform: "uppercase" as const,
            marginTop: 1,
          }}>
            Password Tools
          </span>
        </div>
      )}
    </div>
  );
}
