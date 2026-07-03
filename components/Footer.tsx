import { Shield, Lock, Zap } from "lucide-react";
import SecurePassLogo from "./SecurePassLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#1e5f74]/12 bg-[#eaf6f4] py-12 px-6 mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="mb-3">
              <SecurePassLogo size={28} />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Free, secure password generation tools. All randomness happens in your browser — nothing is ever sent to a server.</p>
          </div>
          <div>
            <h4 className="text-slate-800 font-semibold text-sm mb-3">Tools</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {[
                ["Password Generator",  "/"],
                ["Strength Checker",    "/strength-checker"],
                ["Passphrase Generator","/passphrase"],
                ["PIN Generator",       "/pin-generator"],
              ].map(([l, h]) => (
                <li key={h}><a href={h} className="hover:text-[#1e5f74] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-slate-800 font-semibold text-sm mb-3">Security</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {([
                ["shield", "Uses Web Crypto API — cryptographically secure"],
                ["lock",   "No passwords stored or transmitted"],
                ["zap",    "Instant generation, works offline"],
              ] as const).map(([type, t], i) => (
                <li key={i} className="flex items-start gap-2">
                  {type === "shield" && <Shield size={14} className="mt-0.5 shrink-0 text-[#1e5f74]" />}
                  {type === "lock"   && <Lock   size={14} className="mt-0.5 shrink-0 text-[#1e5f74]" />}
                  {type === "zap"    && <Zap    size={14} className="mt-0.5 shrink-0 text-[#5ca834]" />}
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#1e5f74]/12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} SecurePass. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Lock size={13} className="text-[#1e5f74]" />
            <span className="text-[#1e5f74] font-medium">Cryptographically secure</span> — powered by Web Crypto API
          </p>
        </div>
      </div>
    </footer>
  );
}
