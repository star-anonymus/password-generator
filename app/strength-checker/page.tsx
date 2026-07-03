"use client";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Check { label: string; pass: boolean }

function analyse(pw: string): { entropy: number; checks: Check[]; timeToCrack: string } {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  const entropy = pool > 0 ? Math.round(pw.length * Math.log2(pool)) : 0;

  const checks: Check[] = [
    { label: "At least 8 characters",              pass: pw.length >= 8 },
    { label: "At least 12 characters (recommended)", pass: pw.length >= 12 },
    { label: "Contains uppercase letters",          pass: /[A-Z]/.test(pw) },
    { label: "Contains lowercase letters",          pass: /[a-z]/.test(pw) },
    { label: "Contains numbers",                    pass: /[0-9]/.test(pw) },
    { label: "Contains special characters",         pass: /[^a-zA-Z0-9]/.test(pw) },
    { label: "No repeated characters (e.g. aaa)",  pass: !/(.).*\1\1/.test(pw) },
    { label: "Not a common pattern (123, abc…)",   pass: !/123|abc|qwerty|password|letmein/i.test(pw) },
  ];

  // Rough crack time estimate (10B guesses/sec GPU)
  const combos = Math.pow(pool || 1, pw.length);
  const secs = combos / 10_000_000_000;
  let timeToCrack: string;
  if (secs < 1)           timeToCrack = "instantly";
  else if (secs < 60)     timeToCrack = `${Math.round(secs)} seconds`;
  else if (secs < 3600)   timeToCrack = `${Math.round(secs / 60)} minutes`;
  else if (secs < 86400)  timeToCrack = `${Math.round(secs / 3600)} hours`;
  else if (secs < 31536000) timeToCrack = `${Math.round(secs / 86400)} days`;
  else if (secs < 31536000 * 1000) timeToCrack = `${Math.round(secs / 31536000)} years`;
  else timeToCrack = "centuries";

  return { entropy, checks, timeToCrack };
}

function getStrength(entropy: number) {
  if (entropy < 28) return { label: "Very Weak",  color: "#ef4444", width: "10%" };
  if (entropy < 36) return { label: "Weak",       color: "#f97316", width: "28%" };
  if (entropy < 60) return { label: "Fair",       color: "#eab308", width: "50%" };
  if (entropy < 80) return { label: "Strong",     color: "#059669", width: "75%" };
  return               { label: "Very Strong", color: "#0d9488", width: "100%" };
}

export default function StrengthChecker() {
  const [pw, setPw]     = useState("");
  const [show, setShow] = useState(false);

  const { entropy, checks, timeToCrack } = useMemo(() => analyse(pw), [pw]);
  const strength = getStrength(entropy);
  const passed   = checks.filter((c) => c.pass).length;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Password Strength Checker</h1>
            <p className="text-slate-500">Type or paste a password to see how strong it is. Nothing is stored or sent anywhere.</p>
          </div>

          {/* Input */}
          <div className="relative mb-6">
            <input
              type={show ? "text" : "password"}
              placeholder="Enter your password..."
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full border-2 border-[#059669]/20 rounded-2xl px-5 py-4 text-lg font-mono outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 pr-14 transition-all"
            />
            <button onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {pw && (
            <>
              {/* Score card */}
              <div className="rounded-2xl border border-[#059669]/15 bg-white p-6 mb-5 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Strength</p>
                    <p className="text-2xl font-extrabold" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">Entropy</p>
                    <p className="text-2xl font-extrabold text-slate-800">{entropy} <span className="text-sm font-normal text-slate-400">bits</span></p>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="strength-bar h-full" style={{ width: strength.width, background: strength.color }} />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: `${strength.color}12` }}>
                  <Shield size={16} style={{ color: strength.color }} />
                  <span className="text-sm font-medium" style={{ color: strength.color }}>
                    Estimated crack time: <strong>{timeToCrack}</strong> at 10 billion guesses/sec
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800">Security Checklist</h2>
                  <span className="text-sm font-semibold text-[#059669]">{passed}/{checks.length} passed</span>
                </div>
                <ul className="space-y-2.5">
                  {checks.map(({ label, pass }) => (
                    <li key={label} className="flex items-center gap-3">
                      {pass
                        ? <CheckCircle size={16} className="text-[#059669] shrink-0" />
                        : <XCircle    size={16} className="text-red-400 shrink-0" />}
                      <span className={`text-sm ${pass ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {passed < 5 && (
                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700">
                    This password could be cracked quickly. Use the <a href="/" className="font-semibold underline">generator</a> to create a stronger one.
                  </p>
                </div>
              )}
            </>
          )}

          {!pw && (
            <div className="rounded-xl border border-dashed border-[#059669]/25 p-12 text-center text-slate-400">
              Type a password above to analyse its strength
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
