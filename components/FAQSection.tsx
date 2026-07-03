"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Item { q: string; a: string }
export default function FAQSection({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="faq-item">
          <button
            className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-[#1e5f74]/02 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-slate-800 text-sm leading-snug">{item.q}</span>
            <ChevronDown size={18} className={`text-[#1e5f74] shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96" : "max-h-0"}`}>
            <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-[#1e5f74]/08 pt-4">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
