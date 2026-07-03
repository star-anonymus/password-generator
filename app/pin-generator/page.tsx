"use client";
import { useState, useCallback, useEffect } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function cryptoRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function generatePin(length: number, noRepeats: boolean, noSequential: boolean): string {
  const digits = "0123456789";
  let pin = "";
  let attempts = 0;
  while (attempts < 1000) {
    attempts++;
    pin = Array.from({ length }, () => digits[cryptoRandom(10)]).join("");
    if (noRepeats && /(.).*\1/.test(pin)) continue;
    if (noSequential && /012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210/.test(pin)) continue;
    break;
  }
  return pin;
}

export default function PinGenerator() {
  const [length,        setLength]        = useState(6);
  const [count,         setCount]         = useState(5);
  const [noRepeats,     setNoRepeats]     = useState(false);
  const [noSequential,  setNoSequential]  = useState(false);
  const [pins,          setPins]          = useState<string[]>([]);
  const [copiedIndex,   setCopiedIndex]   = useState<number | null>(null);

  const generate = useCallback(() => {
    setPins(Array.from({ length: count }, () => generatePin(length, noRepeats, noSequential)));
    setCopiedIndex(null);
  }, [length, count, noRepeats, noSequential]);

  useEffect(() => { generate(); }, [generate]);

  const copy = async (pin: string, index: number) => {
    await navigator.clipboard.writeText(pin);
    setCopiedIndex(index);
    toast.success("PIN copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(pins.join("\n"));
    toast.success(`${pins.length} PINs copied!`);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">PIN Generator</h1>
            <p className="text-slate-500">Generate secure numeric PINs — cryptographically random, never guessable.</p>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-5 card-shadow">
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">PIN length</label>
                  <span className="text-sm font-bold text-[#1e5f74] bg-[#1e5f74]/10 px-3 py-0.5 rounded-full">{length}</span>
                </div>
                <input type="range" min={4} max={12} value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-[#1e5f74] h-2 rounded-full cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>4</span><span>12</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">How many PINs</label>
                  <span className="text-sm font-bold text-[#1e5f74] bg-[#1e5f74]/10 px-3 py-0.5 rounded-full">{count}</span>
                </div>
                <input type="range" min={1} max={20} value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-[#1e5f74] h-2 rounded-full cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>20</span></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
              {[
                { label: "No repeated digits (e.g. 112)",    value: noRepeats,    set: setNoRepeats    },
                { label: "No sequential digits (e.g. 123)", value: noSequential, set: setNoSequential },
              ].map(({ label, value, set }) => (
                <button key={label} onClick={() => set(!value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    value
                      ? "border-[#1e5f74] bg-[#1e5f74]/08 text-[#1e5f74]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-[#1e5f74]/30"
                  }`}>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    value ? "border-[#1e5f74] bg-[#1e5f74]" : "border-slate-300"
                  }`}>
                    {value && <Check size={10} className="text-white" strokeWidth={3} />}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={generate}
            className="w-full py-3.5 rounded-2xl text-sm font-bold btn-emerald flex items-center justify-center gap-2 mb-5">
            <RefreshCw size={16} /> Generate PINs
          </button>

          {/* PINs list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-sm">{pins.length} Generated PINs</h2>
              <button onClick={copyAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1e5f74] hover:text-[#1a5266]">
                <Copy size={12} /> Copy All
              </button>
            </div>
            <ul className="space-y-2">
              {pins.map((pin, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-mono text-2xl font-bold text-slate-800 tracking-widest">{pin}</span>
                  <button onClick={() => copy(pin, i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      copiedIndex === i ? "bg-[#1e5f74]/15 text-[#1e5f74]" : "btn-emerald"
                    }`}>
                    {copiedIndex === i ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
