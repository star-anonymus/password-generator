"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import SecurePassLogo from "./SecurePassLogo";

const links = [
  { href: "/",                  label: "Generator" },
  { href: "/strength-checker",  label: "Strength Checker" },
  { href: "/passphrase",        label: "Passphrase" },
  { href: "/pin-generator",     label: "PIN Generator" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#059669]/12">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <SecurePassLogo size={32} />
        </a>
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-[#059669]/08 transition-all duration-200 font-medium">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button className="md:hidden text-slate-500 hover:text-slate-900" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-white border-t border-[#059669]/12 px-6 py-4 flex flex-col gap-1 shadow-md">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-[#059669]/08 transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
