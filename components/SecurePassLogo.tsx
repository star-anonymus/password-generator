"use client";
import { useId } from "react";

const DARK  = "#1e5f74";
const GREEN = "#5ca834";

interface Props { size?: number; iconOnly?: boolean }

export default function SecurePassLogo({ size = 40, iconOnly = false }: Props) {
  const id = useId().replace(/:/g, "");

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.24 }}>
      {/* Shield with rotating C + keyhole — matches logo top-left "Password Generation" variant */}
      <svg width={size} height={size} viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}-sh`} x1="4" y1="4" x2="36" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={DARK} />
            <stop offset="100%" stopColor="#164a5a" />
          </linearGradient>
        </defs>

        {/* Shield outer */}
        <path
          d="M 20 2 L 36 8 L 36 24 C 36 34 28.5 40 20 43 C 11.5 40 4 34 4 24 L 4 8 Z"
          fill={`url(#${id}-sh)`}
        />

        {/* Shield inner highlight */}
        <path
          d="M 20 6 L 33 11 L 33 24 C 33 32 26.5 37.5 20 40 C 13.5 37.5 7 32 7 24 L 7 11 Z"
          fill="rgba(255,255,255,0.1)"
        />

        {/* Circular rotating C arrows (password generation symbol) */}
        {/* Top arc (going right) */}
        <path
          d="M 13 20 A 8 8 0 0 1 27 20"
          stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
        {/* Arrow head on top arc */}
        <path d="M 24.5 16.5 L 27 20 L 23.5 20.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Bottom arc (going left) */}
        <path
          d="M 27 24 A 8 8 0 0 1 13 24"
          stroke={GREEN} strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
        {/* Arrow head on bottom arc */}
        <path d="M 15.5 27.5 L 13 24 L 16.5 23.5" stroke={GREEN} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Central keyhole */}
        <circle cx="20" cy="22" r="2.5" fill="white" />
        <path d="M 18.8 23.5 L 18.8 27 L 21.2 27 L 21.2 23.5" fill="white" />
      </svg>

      {!iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          {/* "SecurePass" — mixed case matching logo, Secure dark + Pass green */}
          <span style={{
            fontSize: size * 0.48,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            display: "inline-block",
          }}>
            <span style={{ color: DARK }}>Secure</span>
            <span style={{ color: GREEN }}>Pass</span>
          </span>
          {/* Green uppercase subtitle matching logo */}
          <span style={{
            fontSize: size * 0.18,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: GREEN,
            textTransform: "uppercase" as const,
            marginTop: 2,
          }}>
            Password Tools
          </span>
        </div>
      )}
    </div>
  );
}
