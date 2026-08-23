"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { federalTenders, type FederalTender } from "@/data/federalTenders";

type RealtimeContextValue = {
  configured: boolean;
  tenders: FederalTender[];
  lastUpdate: Date | null;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  configured: false,
  tenders: federalTenders,
  lastUpdate: null,
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<FederalTender[]>(federalTenders);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    const channels: RealtimeChannel[] = [];

    const tendersChannel = supabase
      .channel("tenders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tenders" },
        (payload) => {
          setLastUpdate(new Date());
          if (payload.eventType === "INSERT" && payload.new) {
            const row = payload.new as Record<string, unknown>;
            setTenders((prev) => [
              {
                reference: String(row.reference ?? ""),
                title: String(row.title ?? ""),
                mda: String(row.mda ?? ""),
                state: row.state ? String(row.state) : null,
                sector: String(row.sector ?? ""),
                value: Number(row.value ?? 0),
                deadline: String(row.deadline ?? ""),
                status: (row.status as FederalTender["status"]) ?? "open",
                source: "nocopo",
                publishedAt: String(row.created_at ?? new Date().toISOString()),
              },
              ...prev,
            ]);
          }
        },
      )
      .subscribe();

    channels.push(tendersChannel);

    const listingsChannel = supabase
      .channel("listings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => setLastUpdate(new Date()),
      )
      .subscribe();

    channels.push(listingsChannel);

    const chatChannel = supabase
      .channel("chat-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => setLastUpdate(new Date()),
      )
      .subscribe();

    channels.push(chatChannel);

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [configured]);

  const value = useMemo(
    () => ({ configured, tenders, lastUpdate }),
    [configured, tenders, lastUpdate],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
