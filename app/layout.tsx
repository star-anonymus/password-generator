import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "SecurePass — Free Password Generator", template: "%s | SecurePass" },
  description: "Generate strong, secure passwords instantly. Customizable length, character sets, strength checker, and one-click copy. 100% free, no signup, runs in your browser.",
  keywords: ["password generator", "strong password", "secure password", "random password", "password strength checker", "free password tool"],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-slate-900 antialiased min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid rgba(5,150,105,0.2)",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            },
            success: { iconTheme: { primary: "#059669", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
