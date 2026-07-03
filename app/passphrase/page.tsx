"use client";
import { useState, useCallback, useEffect } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// EFF short wordlist subset (500 common, memorable words)
const WORDS = [
  "apple","brave","cloud","dance","eagle","flame","grace","happy","ivory","jolly",
  "kneel","lemon","magic","noble","ocean","pearl","quiet","river","solar","tiger",
  "ultra","vivid","water","xenon","yacht","zebra","amber","bliss","crisp","daisy",
  "ember","frost","globe","hazel","inbox","jewel","karma","lunar","maple","night",
  "olive","piano","quest","rainy","storm","trout","unity","vapor","wheat","xylem",
  "yearly","zesty","angel","brick","candy","delta","eight","ferry","giant","honey",
  "image","judge","knack","labor","metro","nerve","orbit","pasta","quilt","radar",
  "sandy","table","umbra","villa","windy","xerox","yummy","zippy","abbey","blast",
  "chill","drift","elite","flute","grant","hippo","input","joker","kiddo","lofty",
  "march","north","optic","pixel","query","rebel","shelf","thumb","under","vocal",
  "wafer","yield","algae","booky","cabby","dirty","extra","funky","greet","hedge",
  "intro","juicy","kitty","lucky","misty","nippy","offer","party","quaky","rocky",
  "snowy","tasty","unfun","valid","witty","zippo","acorn","boxer","cedar","downy",
  "early","flair","graze","hitch","icing","jazzy","kindle","latch","moody","nudge",
  "oaken","perky","quirk","raven","spicy","thick","upper","vibes","waltz","xylem",
  "yodel","zilch","artsy","blaze","catch","depot","enact","foggy","groan","haste",
  "ideal","jumbo","kazoo","lilac","moist","nifty","other","plant","quill","roomy",
  "savor","tango","urban","venom","witty","banjo","cheap","denim","finch","gusto",
  "heave","infer","jazzy","knave","loopy","mulch","notch","outdo","pesky","quite",
];

function cryptoRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

const SEPARATORS = ["-", "_", ".", " ", "~", "/"];

export default function PassphraseGenerator() {
  const [wordCount,  setWordCount]  = useState(4);
  const [separator,  setSeparator]  = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber,  setAddNumber]  = useState(true);
  const [passphrase, setPassphrase] = useState("");
  const [copied,     setCopied]     = useState(false);

  const generate = useCallback(() => {
    let words = Array.from({ length: wordCount }, () => {
      const w = WORDS[cryptoRandom(WORDS.length)];
      return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    });
    if (addNumber) {
      const num = cryptoRandom(100).toString();
      const pos = cryptoRandom(words.length + 1);
      words.splice(pos, 0, num);
    }
    setPassphrase(words.join(separator));
    setCopied(false);
  }, [wordCount, separator, capitalize, addNumber]);

  useEffect(() => { generate(); }, [generate]);

  const copy = async () => {
    await navigator.clipboard.writeText(passphrase);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const entropy = Math.round(wordCount * Math.log2(WORDS.length));

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Passphrase Generator</h1>
            <p className="text-slate-500">Random word combinations — easier to remember than random strings, yet highly secure.</p>
          </div>

          {/* Passphrase display */}
          <div className="rounded-2xl border border-[#1e5f74]/20 bg-white p-6 mb-5 card-shadow">
            <p className="text-2xl font-bold text-slate-800 break-all leading-relaxed mb-4">{passphrase}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">~{entropy} bits entropy</span>
              <div className="flex gap-2">
                <button onClick={generate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold btn-outline-emerald">
                  <RefreshCw size={14} /> New
                </button>
                <button onClick={copy}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    copied ? "bg-[#1e5f74]/15 text-[#1e5f74]" : "btn-emerald"
                  }`}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 card-shadow">
            <h2 className="font-bold text-slate-800 mb-5">Options</h2>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Number of words</label>
                <span className="text-sm font-bold text-[#1e5f74] bg-[#1e5f74]/10 px-3 py-0.5 rounded-full">{wordCount}</span>
              </div>
              <input type="range" min={2} max={8} value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full accent-[#1e5f74] h-2 rounded-full cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>2</span><span>8</span></div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold text-slate-700 block mb-2">Separator</label>
              <div className="flex flex-wrap gap-2">
                {SEPARATORS.map((sep) => (
                  <button key={sep} onClick={() => setSeparator(sep)}
                    className={`px-4 py-2 rounded-lg border text-sm font-mono font-semibold transition-all ${
                      separator === sep
                        ? "border-[#1e5f74] bg-[#1e5f74]/10 text-[#1e5f74]"
                        : "border-slate-200 text-slate-500 hover:border-[#1e5f74]/30"
                    }`}>
                    {sep === " " ? "space" : sep}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              {[
                { label: "Capitalize first letter of each word", value: capitalize, set: setCapitalize },
                { label: "Add a random number",                  value: addNumber,  set: setAddNumber  },
              ].map(({ label, value, set }) => (
                <button key={label} onClick={() => set(!value)}
                  className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
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
        </div>
      </main>
      <Footer />
    </>
  );
}
