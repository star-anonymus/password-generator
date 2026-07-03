"use client";
import { useState, useCallback, useEffect } from "react";
import { Copy, RefreshCw, Check, Shield, Zap, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SecurePassLogo from "@/components/SecurePassLogo";

const UPPER  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER  = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMS   = "!@#$%^&*()-_=+[]{}|;:,.<>?";
const AMBIG  = "0O1lI";

function cryptoRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function generatePassword(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  customExclude: string;
}): string {
  let pool = "";
  if (opts.upper)   pool += UPPER;
  if (opts.lower)   pool += LOWER;
  if (opts.digits)  pool += DIGITS;
  if (opts.symbols) pool += SYMS;
  if (opts.excludeAmbiguous) pool = pool.split("").filter((c) => !AMBIG.includes(c)).join("");
  if (opts.customExclude) pool = pool.split("").filter((c) => !opts.customExclude.includes(c)).join("");
  if (!pool) return "";

  // Guarantee at least one char from each enabled set
  const required: string[] = [];
  if (opts.upper)   required.push(UPPER[cryptoRandom(UPPER.length)]);
  if (opts.lower)   required.push(LOWER[cryptoRandom(LOWER.length)]);
  if (opts.digits)  required.push(DIGITS[cryptoRandom(DIGITS.length)]);
  if (opts.symbols) required.push(SYMS[cryptoRandom(SYMS.length)]);

  const remaining = Array.from({ length: opts.length - required.length }, () => pool[cryptoRandom(pool.length)]);
  const all = [...required, ...remaining];

  // Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = cryptoRandom(i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.join("");
}

function calcEntropy(length: number, poolSize: number): number {
  if (!poolSize) return 0;
  return Math.round(length * Math.log2(poolSize));
}

function getStrength(entropy: number): { label: string; color: string; bg: string; width: string } {
  if (entropy < 28)  return { label: "Very Weak",  color: "#ef4444", bg: "#fef2f2", width: "15%" };
  if (entropy < 36)  return { label: "Weak",       color: "#f97316", bg: "#fff7ed", width: "30%" };
  if (entropy < 60)  return { label: "Fair",       color: "#eab308", bg: "#fefce8", width: "50%" };
  if (entropy < 80)  return { label: "Strong",     color: "#059669", bg: "#ecfdf5", width: "75%" };
  return               { label: "Very Strong", color: "#0d9488", bg: "#f0fdfa", width: "100%" };
}

export default function PasswordGenerator() {
  const [length,           setLength]           = useState(16);
  const [useUpper,         setUseUpper]         = useState(true);
  const [useLower,         setUseLower]         = useState(true);
  const [useDigits,        setUseDigits]        = useState(true);
  const [useSymbols,       setUseSymbols]       = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [customExclude,    setCustomExclude]    = useState("");
  const [password,         setPassword]         = useState("");
  const [copied,           setCopied]           = useState(false);
  const [show,             setShow]             = useState(true);
  const [history,          setHistory]          = useState<string[]>([]);

  const poolSize = (
    (useUpper   ? UPPER.length  : 0) +
    (useLower   ? LOWER.length  : 0) +
    (useDigits  ? DIGITS.length : 0) +
    (useSymbols ? SYMS.length   : 0)
  );
  const entropy  = calcEntropy(length, poolSize);
  const strength = getStrength(entropy);

  const generate = useCallback(() => {
    const pw = generatePassword({ length, upper: useUpper, lower: useLower, digits: useDigits, symbols: useSymbols, excludeAmbiguous, customExclude });
    setPassword(pw);
    setCopied(false);
    if (pw) setHistory((h) => [pw, ...h].slice(0, 8));
  }, [length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous, customExclude]);

  useEffect(() => { generate(); }, [generate]);

  const copy = async (pw = password) => {
    if (!pw) return;
    await navigator.clipboard.writeText(pw);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (setter: (v: boolean) => void, current: boolean, others: boolean[]) => {
    if (current && others.every((v) => !v)) return; // keep at least one
    setter(!current);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <SecurePassLogo size={52} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
              <span className="gradient-text">Secure</span> Password Generator
            </h1>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              Cryptographically random passwords using the Web Crypto API. Nothing leaves your browser.
            </p>
          </div>

          {/* Password display */}
          <div className="rounded-2xl border border-[#059669]/20 bg-white p-6 mb-5 card-shadow">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <p className="password-display text-slate-900 break-all leading-relaxed">
                  {show ? password : "•".repeat(password.length)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 mt-1">
                <button onClick={() => setShow(!show)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={generate}
                  className="p-2 rounded-lg text-[#059669] hover:bg-[#059669]/10 transition-all">
                  <RefreshCw size={18} />
                </button>
                <button onClick={() => copy()}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    copied ? "bg-[#059669]/15 text-[#059669]" : "btn-emerald"
                  }`}>
                  {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Strength bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                <span className="text-xs text-slate-400">{entropy} bits entropy</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="strength-bar h-full" style={{ width: strength.width, background: strength.color }} />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-5 card-shadow">
            <h2 className="font-bold text-slate-800 mb-5">Options</h2>

            {/* Length slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Length</label>
                <span className="text-sm font-bold text-[#059669] bg-[#059669]/10 px-3 py-0.5 rounded-full">{length}</span>
              </div>
              <input type="range" min={4} max={128} value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-[#059669] h-2 rounded-full cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>4</span><span>128</span></div>
            </div>

            {/* Character sets */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Uppercase (A-Z)", value: useUpper,   set: setUseUpper,   others: [useLower, useDigits, useSymbols] },
                { label: "Lowercase (a-z)", value: useLower,   set: setUseLower,   others: [useUpper, useDigits, useSymbols] },
                { label: "Numbers (0-9)",   value: useDigits,  set: setUseDigits,  others: [useUpper, useLower,  useSymbols] },
                { label: "Symbols (!@#…)",  value: useSymbols, set: setUseSymbols, others: [useUpper, useLower,  useDigits]  },
              ].map(({ label, value, set, others }) => (
                <button key={label} onClick={() => toggle(set, value, others)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    value
                      ? "border-[#059669] bg-[#059669]/08 text-[#059669]"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-[#059669]/30"
                  }`}>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    value ? "border-[#059669] bg-[#059669]" : "border-slate-300"
                  }`}>
                    {value && <Check size={10} className="text-white" strokeWidth={3} />}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            {/* Extra options */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <button onClick={() => setExcludeAmbiguous(!excludeAmbiguous)}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                  excludeAmbiguous
                    ? "border-[#059669] bg-[#059669]/08 text-[#059669]"
                    : "border-slate-200 bg-white text-slate-500 hover:border-[#059669]/30"
                }`}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  excludeAmbiguous ? "border-[#059669] bg-[#059669]" : "border-slate-300"
                }`}>
                  {excludeAmbiguous && <Check size={10} className="text-white" strokeWidth={3} />}
                </span>
                Exclude ambiguous characters (0, O, l, 1, I)
              </button>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600 shrink-0">Exclude chars:</label>
                <input
                  type="text"
                  placeholder="e.g. @#$"
                  value={customExclude}
                  onChange={(e) => setCustomExclude(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10"
                />
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button onClick={generate}
            className="w-full py-4 rounded-2xl text-base font-bold btn-emerald flex items-center justify-center gap-2 mb-8">
            <RefreshCw size={18} /> Generate New Password
          </button>

          {/* Quick presets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-5 card-shadow">
            <h2 className="font-bold text-slate-800 mb-4 text-sm">Quick Presets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "PIN (4)",        fn: () => { setLength(4);  setUseUpper(false); setUseLower(false); setUseDigits(true); setUseSymbols(false); } },
                { label: "Simple (12)",    fn: () => { setLength(12); setUseUpper(true);  setUseLower(true);  setUseDigits(true); setUseSymbols(false); } },
                { label: "Strong (20)",    fn: () => { setLength(20); setUseUpper(true);  setUseLower(true);  setUseDigits(true); setUseSymbols(true);  } },
                { label: "Maximum (32)",   fn: () => { setLength(32); setUseUpper(true);  setUseLower(true);  setUseDigits(true); setUseSymbols(true);  } },
              ].map(({ label, fn }) => (
                <button key={label} onClick={fn}
                  className="px-3 py-2 rounded-lg border border-[#059669]/25 text-xs font-semibold text-[#059669] hover:bg-[#059669]/08 hover:border-[#059669]/50 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow">
              <h2 className="font-bold text-slate-800 mb-3 text-sm">Recent Passwords</h2>
              <ul className="space-y-2">
                {history.slice(1).map((pw, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                    <span className="font-mono text-xs text-slate-500 truncate">{pw}</span>
                    <button onClick={() => copy(pw)}
                      className="flex items-center gap-1 text-xs text-[#059669] hover:text-[#047857] font-medium shrink-0">
                      <Copy size={11} /> Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Shield, text: "Web Crypto API",    sub: "Cryptographically secure" },
              { icon: Lock,   text: "Never transmitted", sub: "100% client-side" },
              { icon: Zap,    text: "Instant & free",    sub: "No account needed" },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <p className="text-xs font-semibold text-slate-700">{text}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
