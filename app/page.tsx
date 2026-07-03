"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Copy, RefreshCw, Check, Shield, Zap, Lock, Eye, EyeOff,
  AlertTriangle, TrendingUp, BookOpen, CheckCircle, XCircle,
  Lightbulb, Users, Globe, Key,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";

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

  const required: string[] = [];
  if (opts.upper)   required.push(UPPER[cryptoRandom(UPPER.length)]);
  if (opts.lower)   required.push(LOWER[cryptoRandom(LOWER.length)]);
  if (opts.digits)  required.push(DIGITS[cryptoRandom(DIGITS.length)]);
  if (opts.symbols) required.push(SYMS[cryptoRandom(SYMS.length)]);

  const remaining = Array.from({ length: opts.length - required.length }, () => pool[cryptoRandom(pool.length)]);
  const all = [...required, ...remaining];

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

function getStrength(entropy: number): { label: string; color: string; bg: string; width: string; pill: string } {
  if (entropy < 28)  return { label: "Very Weak",  color: "#ef4444", bg: "#fef2f2", width: "15%",  pill: "bg-red-100 text-red-600 border-red-200" };
  if (entropy < 36)  return { label: "Weak",       color: "#f97316", bg: "#fff7ed", width: "30%",  pill: "bg-orange-100 text-orange-600 border-orange-200" };
  if (entropy < 60)  return { label: "Fair",       color: "#eab308", bg: "#fefce8", width: "50%",  pill: "bg-yellow-100 text-yellow-600 border-yellow-200" };
  if (entropy < 80)  return { label: "Strong",     color: "#059669", bg: "#ecfdf5", width: "75%",  pill: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  return               { label: "Very Strong", color: "#0d9488", bg: "#f0fdfa", width: "100%", pill: "bg-teal-100 text-teal-700 border-teal-200" };
}

const FAQ_ITEMS = [
  {
    q: "Is SecurePass truly secure?",
    a: "Yes. SecurePass uses the Web Crypto API (window.crypto.getRandomValues) which is a cryptographically secure pseudorandom number generator (CSPRNG) built into every modern browser. It's the same API used by banking applications.",
  },
  {
    q: "Do you store the passwords I generate?",
    a: "No. Generated passwords exist only in your browser's memory and are never sent to any server. We have no backend, no database, and no analytics that capture your passwords.",
  },
  {
    q: "What does entropy mean and how much do I need?",
    a: "Entropy measures how unpredictable a password is, in bits. Below 28 bits = crackable instantly. 60+ bits = strong. 80+ bits = very strong. For most accounts, aim for at least 60 bits. For high-value accounts, use 80+.",
  },
  {
    q: "Is a longer password always better than a complex one?",
    a: "Generally yes — length contributes more to entropy than complexity. 'correcthorsebatterystaple' (25 chars, all lowercase) has ~117 bits of entropy. 'P@s$' (4 chars with symbols) has only ~26 bits.",
  },
  {
    q: "Should I use a passphrase instead of a random password?",
    a: "Passphrases (multiple words joined by a separator) are great for master passwords you need to type and remember. Random character passwords are better for everything stored in a password manager.",
  },
  {
    q: "What's the difference between SecurePass and a password manager?",
    a: "SecurePass generates passwords. A password manager stores and autofills them. Use SecurePass to create strong passwords, then store them in a password manager like Bitwarden, 1Password, or KeePass.",
  },
];

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
    if (current && others.every((v) => !v)) return;
    setter(!current);
  };

  return (
    <>
      <Navbar />
      <main>

        {/* ── SECTION A: HERO ── */}
        <section className="relative overflow-hidden pt-28 pb-12 px-6 bg-white">
          {/* dot grid */}
          <div className="hero-pattern absolute inset-0 z-0 pointer-events-none" />
          {/* orb */}
          <div className="absolute -top-32 -right-20 w-[450px] h-[450px] rounded-full bg-[#059669]/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#059669]/20 shadow-sm text-[#059669] text-xs font-bold mb-5">
              🔐 Powered by Web Crypto API · Military-Grade Randomness
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-4 text-slate-900">
              Generate{" "}
              <span className="gradient-text">Unbreakable</span>{" "}
              Passwords.
            </h1>

            <p className="text-slate-500 text-lg max-w-lg mx-auto mb-8">
              Cryptographically secure passwords using your device&apos;s native Crypto API. Nothing leaves your browser — ever.
            </p>

            {/* trust strip */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
              {["Web Crypto API", "Zero data sent", "Works offline", "Always free"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION B: THE GENERATOR ── */}
        <section className="max-w-2xl mx-auto px-6 pb-16">

          {/* Password display card */}
          <div className="rounded-3xl border border-[#059669]/20 bg-white p-7 mb-5 shadow-[0_4px_24px_rgba(5,150,105,0.08)]">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex-1 min-w-0">
                <p className="password-display text-slate-900 break-all leading-relaxed text-xl">
                  {show ? password : "•".repeat(password.length)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 mt-1">
                <button onClick={() => setShow(!show)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={generate}
                  className="p-2.5 rounded-xl text-[#059669] hover:bg-[#059669]/10 transition-all">
                  <RefreshCw size={18} />
                </button>
                <button onClick={() => copy()}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    copied ? "bg-[#059669]/15 text-[#059669]" : "btn-emerald"
                  }`}>
                  {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Strength */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${strength.pill}`}>
                  {strength.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">{entropy} bits entropy</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="strength-bar h-full" style={{ width: strength.width, background: strength.color }} />
              </div>
            </div>
          </div>

          {/* Options card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 mb-5 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-6 text-base">Options</h2>

            {/* Length slider */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700">Password Length</label>
                <span className="text-sm font-black text-[#059669] bg-[#059669]/10 px-4 py-1 rounded-full tabular-nums">{length}</span>
              </div>
              <input type="range" min={4} max={128} value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-[#059669] h-2 rounded-full cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400 mt-1.5 font-medium"><span>4</span><span>128</span></div>
            </div>

            {/* Character sets — pill style */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Uppercase (A–Z)", value: useUpper,   set: setUseUpper,   others: [useLower, useDigits, useSymbols] },
                { label: "Lowercase (a–z)", value: useLower,   set: setUseLower,   others: [useUpper, useDigits, useSymbols] },
                { label: "Numbers (0–9)",   value: useDigits,  set: setUseDigits,  others: [useUpper, useLower,  useSymbols] },
                { label: "Symbols (!@#…)",  value: useSymbols, set: setUseSymbols, others: [useUpper, useLower,  useDigits]  },
              ].map(({ label, value, set, others }) => (
                <button key={label} onClick={() => toggle(set, value, others)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all text-left ${
                    value
                      ? "border-[#059669] bg-[#059669]/08 text-[#059669]"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-[#059669]/30 hover:bg-slate-100"
                  }`}>
                  <span className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    value ? "border-[#059669] bg-[#059669]" : "border-slate-300"
                  }`}>
                    {value && <Check size={10} className="text-white" strokeWidth={3} />}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            {/* Extra options */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button onClick={() => setExcludeAmbiguous(!excludeAmbiguous)}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl border text-sm font-semibold transition-all text-left ${
                  excludeAmbiguous
                    ? "border-[#059669] bg-[#059669]/08 text-[#059669]"
                    : "border-slate-200 bg-white text-slate-500 hover:border-[#059669]/30"
                }`}>
                <span className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  excludeAmbiguous ? "border-[#059669] bg-[#059669]" : "border-slate-300"
                }`}>
                  {excludeAmbiguous && <Check size={10} className="text-white" strokeWidth={3} />}
                </span>
                Exclude ambiguous characters (0, O, l, 1, I)
              </button>

              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-600 shrink-0">Exclude chars:</label>
                <input
                  type="text"
                  placeholder="e.g. @#$"
                  value={customExclude}
                  onChange={(e) => setCustomExclude(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button onClick={generate}
            className="w-full py-4 rounded-2xl text-base font-bold btn-emerald flex items-center justify-center gap-2 mb-6 shadow-[0_6px_24px_rgba(5,150,105,0.3)] hover:shadow-[0_8px_32px_rgba(5,150,105,0.4)] transition-all">
            <RefreshCw size={18} /> Generate New Password
          </button>

          {/* Quick presets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-5 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wider">Quick Presets</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "PIN (4-digit)",    fn: () => { setLength(4);  setUseUpper(false); setUseLower(false); setUseDigits(true); setUseSymbols(false); } },
                { label: "Simple (12)",      fn: () => { setLength(12); setUseUpper(true);  setUseLower(true);  setUseDigits(true); setUseSymbols(false); } },
                { label: "Strong (20)",      fn: () => { setLength(20); setUseUpper(true);  setUseLower(true);  setUseDigits(true); setUseSymbols(true);  } },
                { label: "Maximum (32)",     fn: () => { setLength(32); setUseUpper(true);  setUseLower(true);  setUseDigits(true); setUseSymbols(true);  } },
              ].map(({ label, fn }) => (
                <button key={label} onClick={fn}
                  className="px-4 py-1.5 rounded-full border border-[#059669]/25 text-xs font-semibold text-[#059669] hover:bg-[#059669]/08 hover:border-[#059669]/50 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wider">Recent Passwords</h2>
              <ul className="space-y-1.5">
                {history.slice(1).map((pw, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="font-mono text-xs text-slate-500 truncate">{pw}</span>
                    <button onClick={() => copy(pw)}
                      className="flex items-center gap-1 text-xs text-[#059669] hover:text-[#047857] font-semibold shrink-0 transition-colors">
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
        </section>

        {/* ── SECTION C: BREACH STATS ── */}
        <section className="bg-[#ecfdf5] border-y border-[#059669]/12 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Why Password Security Matters</h2>
              <p className="text-slate-500 text-base">The numbers that show how critical strong passwords are</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  value: "81%",
                  label: "of data breaches involve weak or stolen passwords",
                  icon: AlertTriangle,
                  color: "text-red-500",
                  iconColor: "text-red-400",
                  iconBg: "bg-red-50",
                },
                {
                  value: "6 sec",
                  label: "to crack a 6-character password at 10B guesses/sec",
                  icon: TrendingUp,
                  color: "text-red-500",
                  iconColor: "text-red-400",
                  iconBg: "bg-red-50",
                },
                {
                  value: "59%",
                  label: "of people reuse the same password across multiple sites",
                  icon: Users,
                  color: "text-red-500",
                  iconColor: "text-red-400",
                  iconBg: "bg-red-50",
                },
                {
                  value: "3.5B",
                  label: "accounts protected by strong, unique passwords",
                  icon: Lock,
                  color: "text-[#059669]",
                  iconColor: "text-[#059669]",
                  iconBg: "bg-[#059669]/10",
                },
              ].map(({ value, label, icon: Icon, color, iconColor, iconBg }) => (
                <div key={value} className="bg-white border border-[#059669]/14 rounded-2xl p-6 text-center">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={20} />
                  </div>
                  <div className={`text-4xl font-black ${color} mb-2 leading-none`}>{value}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-6">Sources: Verizon DBIR 2023, Google Security Blog</p>
          </div>
        </section>

        {/* ── SECTION D: BEST PRACTICES ── */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Password Security Best Practices</h2>
              <p className="text-slate-500 text-base">Follow these guidelines to stay protected online</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Key,
                  title: "Use Unique Passwords",
                  body: "Never reuse passwords across sites. If one site is breached, attackers will try the same password on every other service you use.",
                },
                {
                  icon: Lock,
                  title: "Make Them Long",
                  body: "Length is the single most important factor. A 20-character password of only lowercase letters is stronger than a 10-character password with symbols.",
                },
                {
                  icon: Globe,
                  title: "Use a Password Manager",
                  body: "You only need to remember one master password. Tools like Bitwarden, 1Password, or KeePass store and autofill the rest securely.",
                },
                {
                  icon: Shield,
                  title: "Enable Two-Factor Authentication",
                  body: "Even if your password is stolen, 2FA prevents attackers from logging in. Use an authenticator app over SMS where possible.",
                },
                {
                  icon: BookOpen,
                  title: "Never Share Passwords",
                  body: "Don't email, text, or tell others your passwords. Legitimate services will never ask you for your password.",
                },
                {
                  icon: AlertTriangle,
                  title: "Change Compromised Passwords",
                  body: "If a site you use reports a breach, change that password immediately. Use haveibeenpwned.com to check if your email has been compromised.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="tip-card">
                  <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION E: MYTHS ── */}
        <section className="bg-[#ecfdf5] py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Password Myths — Debunked</h2>
              <p className="text-slate-500 text-base">Common misconceptions that leave you vulnerable</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  myth: "Replacing letters with numbers and symbols makes passwords secure (p@ssw0rd)",
                  truth: "Attackers know all common substitutions. 'p@ssw0rd' is just as weak as 'password' to modern cracking software. Use length and true randomness instead.",
                },
                {
                  myth: "I'll remember it, so I don't need a password manager",
                  truth: "You need dozens of unique passwords. The human brain cannot securely remember 50+ unique 20-character strings. Password managers exist for exactly this reason.",
                },
                {
                  myth: "Changing passwords regularly keeps you safe",
                  truth: "Frequent mandatory changes often lead to weaker passwords (Password1 → Password2). Only change passwords when you suspect a breach.",
                },
                {
                  myth: "A short password with symbols is safer than a long one without",
                  truth: "'correct-horse-battery-staple' (28 chars, all lowercase, spaces) takes centuries to crack. 'P@ss!' (5 chars) takes milliseconds.",
                },
              ].map(({ myth, truth }) => (
                <div key={myth} className="myth-card flex">
                  <div className="w-1.5 shrink-0 bg-red-400 self-stretch" />
                  <div className="p-5 flex-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full mb-2">
                      <XCircle size={12} /> MYTH
                    </span>
                    <p className="text-slate-700 font-semibold text-sm mb-3">{myth}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] bg-[#059669]/08 border border-[#059669]/20 px-2.5 py-1 rounded-full mb-2">
                      <CheckCircle size={12} /> TRUTH
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">{truth}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION F: FAQ ── */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Frequently Asked Questions</h2>
              <p className="text-slate-500 text-base">Everything you need to know about password security</p>
            </div>
            <FAQSection items={FAQ_ITEMS} />
          </div>
        </section>

        {/* ── SECTION G: CTA ── */}
        <section className="cta-gradient py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
              Free Forever
            </span>
            <h2 className="text-4xl font-black text-white mb-4">Generate Your First Secure Password</h2>
            <p className="text-white/80 mb-8 text-lg">Cryptographically random. Never stored. Always free.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-white text-[#059669] font-bold px-8 py-4 rounded-2xl text-base shadow-lg hover:shadow-xl hover:bg-[#f0fdf4] transition-all">
              Generate Password Now
            </button>
            <p className="text-white/60 text-sm mt-6">Web Crypto API · 0 bytes uploaded · 100% free</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
