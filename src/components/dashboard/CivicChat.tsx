"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";

const starters = [
  "Emergency numbers near me",
  "Open tenders this month",
  "Verified hospitals nearby",
  "Business permits overview",
];

function answerFor(query: string, state: string) {
  const q = query.toLowerCase();
  if (q.includes("emergency") || q.includes("police") || q.includes("hospital")) {
    return `In ${state}, dial 112 for national emergency. Open Emergency in the portal for state police, fire, ambulance, and hospital directories.`;
  }
  if (q.includes("tender") || q.includes("contract") || q.includes("bid")) {
    return `Open Procurement to see tenders focused on ${state}, plus federal listings. Filter by sector and deadline, then review eligibility before bidding.`;
  }
  if (q.includes("permit") || q.includes("law") || q.includes("licence")) {
    return `Open State Hub for ${state} to browse by-laws, executive orders, and MDA contacts. For food or construction permits, start with Commerce and Lands agencies listed there.`;
  }
  if (q.includes("business") || q.includes("directory") || q.includes("hotel")) {
    return `Use Directory or Market Hub with ${state} selected in the header. Filter by category, verified badge, and “open now” where available.`;
  }
  return `I can help with ${state} emergencies, directory lookups, state laws, and open tenders. Try one of the suggested prompts, or open State Hub / Procurement for the full record.`;
}

export default function CivicChat() {
  const { selectedState } = useDashboardSearch();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: `Civic desk ready for ${selectedState}. Ask about emergencies, businesses, laws, or tenders.`,
    },
  ]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "assistant", text: answerFor(trimmed, selectedState) },
    ]);
    setInput("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-navy/10 md:right-6">
          <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">AI Civic Desk</p>
              <p className="text-[11px] text-white/50">{selectedState} context</p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-8 bg-forest text-white"
                    : "mr-6 bg-[#f4f6f8] text-navy"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-navy/8 px-3 py-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full bg-[#f4f6f8] px-2.5 py-1 text-[11px] font-medium text-navy hover:bg-orange-soft"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 border-t border-navy/8 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this state…"
              className="min-w-0 flex-1 rounded-xl bg-[#f4f6f8] px-3 py-2 text-sm outline-none ring-1 ring-navy/8 focus:ring-forest/30"
            />
            <button
              type="submit"
              aria-label="Send"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label="Open civic chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white shadow-lg shadow-forest/30"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
