"use client";

import { useState, useRef, useEffect, type FormEvent, type WheelEvent } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const starters = [
  "Emergency numbers",
  "Open tenders",
  "Who is the governor?",
  "Business permits",
];

export default function CivicChat() {
  const { selectedState } = useDashboardSearch();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        text: `You're viewing ${selectedState}. Ask about emergencies, tenders, permits, or who's in charge.`,
      },
    ]);
  }, [selectedState]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          state: selectedState,
          history: messages,
        }),
      });
      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Couldn't reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  /** Keep wheel scroll inside the message list — never bubble to the page. */
  const onListWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop <= 0 && e.deltaY < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
    if (atTop || atBottom) {
      e.preventDefault();
    }
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close chat overlay"
          className="fixed inset-0 z-40 bg-navy-deep/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out",
          open
            ? // Fixed height (not just max-height) so the message pane can scroll
              "inset-x-0 bottom-0 h-[min(85dvh,640px)] rounded-t-[24px] md:inset-x-auto md:bottom-24 md:right-6 md:h-[min(80dvh,560px)] md:w-[min(100vw-2rem,420px)] md:rounded-[24px] md:ring-1 md:ring-navy/10"
            : "pointer-events-none h-0 opacity-0",
        )}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-3 md:hidden">
          <div className="h-1 w-10 rounded-full bg-navy/15" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-navy/8 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-navy">Help desk</p>
            <p className="text-xs text-slate">{selectedState}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {selectedState}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Only this region scrolls */}
        <div
          ref={listRef}
          onWheel={onListWheel}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={cn(
                  "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-forest text-white"
                    : "mr-auto bg-[#f4f6f8] text-navy",
                )}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-[#f4f6f8] px-3.5 py-2.5 text-sm text-slate">
                <Loader2 className="h-4 w-4 animate-spin text-forest" />
                One moment…
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-navy/8 px-3 py-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => ask(s)}
                className="shrink-0 rounded-full bg-[#f4f6f8] px-3 py-1.5 text-xs font-medium text-navy hover:bg-orange-soft disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex shrink-0 gap-2 border-t border-navy/8 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={`Ask about ${selectedState}…`}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Button
        size="icon"
        aria-label={open ? "Close help desk" : "Open help desk"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-50 h-14 w-14 rounded-full shadow-lg shadow-forest/25 transition-transform hover:scale-105",
          "bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))]",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </>
  );
}
