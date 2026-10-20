"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Clock, ExternalLink, FileText, MapPin, Plus, Search } from "lucide-react";
import BidModal from "@/components/dashboard/BidModal";
import CreateContractModal from "@/components/dashboard/CreateContractModal";
import { useSession } from "@/components/SessionProvider";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useMyBusiness } from "@/lib/db/myBusiness";
import { useTenders, type TenderItem } from "@/lib/db/tenders";
import { stateDisplayName } from "@/data/marketplace";
import type { TenderBid } from "@/lib/bids";

type SectorFilter = "All" | string;
type BoardMode = "live" | "catalogue";
type SortTab = "Latest" | "Closing Soon";

function publisherLabel(type?: TenderItem["publisherType"]) {
  if (type === "business") return "Business";
  if (type === "federal") return "Federal";
  return "Government";
}

export default function ProcurementIntel() {
  const { user, submitBid, bidForTender } = useSession();
  const { search, setSearch, selectedState } = useDashboardSearch();
  const { liveTenders, catalogueTenders, loading, error, reload } =
    useTenders(selectedState);
  const { business } = useMyBusiness(user?.id, user?.email);
  const isBusiness = user?.role === "business" || user?.role === "admin";
  const [boardMode, setBoardMode] = useState<BoardMode>("live");
  const [tab, setTab] = useState<SortTab>("Latest");
  const [sector, setSector] = useState<SectorFilter>("All");
  const [activeTender, setActiveTender] = useState<TenderItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const sourceList = boardMode === "live" ? liveTenders : catalogueTenders;

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(sourceList.map((t) => t.sector))).sort()],
    [sourceList],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = sector === "All" ? sourceList : sourceList.filter((t) => t.sector === sector);
    if (q) {
      list = list.filter((t) => {
        const hay = `${t.ref} ${t.title} ${t.agency} ${t.sector} ${t.budget}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (tab === "Closing Soon") {
      list = [...list].sort(
        (a, b) => Number(b.urgent) - Number(a.urgent) || a.deadline.localeCompare(b.deadline),
      );
    }
    return list;
  }, [sourceList, sector, tab, search]);

  const stateLabel = stateDisplayName(selectedState);
  const totalValue = sourceList.reduce((sum, t) => {
    const match = t.budget.match(/[\d.]+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0);

  const openBid = (tender: TenderItem) => {
    if (!tender.live) {
      toast.error(
        "Reference catalogue only — switch to Live contracts to bid, or publish your own contract.",
      );
      return;
    }
    if (!isBusiness) {
      toast.error("Register as a business to submit bids.");
      return;
    }
    if (!business) {
      toast.error("Set up your business profile first — Profile → Set up business.");
      return;
    }
    setActiveTender(tender);
  };

  const openCreate = () => {
    if (!isBusiness) {
      toast.error("Register as a business to publish contracts.");
      return;
    }
    if (!business) {
      toast.error("Set up your business profile before publishing a contract.");
      return;
    }
    setCreateOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Procurement
          </h1>
          <p className="mt-1 max-w-2xl text-slate">
            Live contracts for {stateLabel} — federal notices, Edo LGA/state records we sourced,
            and business-published RFPs. Bid on any open live row.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBusiness ? (
            <>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
              >
                <Plus className="h-4 w-4" />
                Publish contract
              </button>
              <Link
                href="/dashboard/profile"
                className="rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
              >
                {business ? "My contracts & bids" : "Set up business"}
              </Link>
            </>
          ) : (
            <Link
              href="/signup?role=business"
              className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              Register to bid
            </Link>
          )}
          <Link
            href="/procurement"
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Public board
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load live tenders: {error}. Check that the API is running and
          reachable.
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi value={String(liveTenders.length)} label="Live contracts (biddable)" />
        <Kpi
          value={liveTenders.filter((t) => t.urgent).length.toString()}
          label="Closing within 7 days"
        />
        <Kpi
          value={totalValue > 0 ? `${totalValue.toFixed(0)}B+ NGN` : "—"}
          label="Combined est. value"
        />
      </div>

      <section className="mt-6 rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
              <FileText className="h-4 w-4" /> Contracts
            </h2>
            <div className="inline-flex rounded-full bg-mist p-1">
              <button
                type="button"
                onClick={() => setBoardMode("live")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  boardMode === "live" ? "bg-white text-forest shadow-sm" : "text-slate"
                }`}
              >
                Live ({liveTenders.length})
              </button>
              <button
                type="button"
                onClick={() => setBoardMode("catalogue")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  boardMode === "catalogue" ? "bg-white text-forest shadow-sm" : "text-slate"
                }`}
              >
                Reference ({catalogueTenders.length})
              </button>
            </div>
          </div>

          {boardMode === "live" ? (
            <p className="text-xs text-slate">
              Government and business contracts in the database — bid here. Publish yours with
              “Publish contract”.
            </p>
          ) : (
            <p className="text-xs text-slate">
              National reference catalogue for research. These are not biddable here — use Live
              contracts or ask your state to publish them.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All sectors" : s}
                  </option>
                ))}
              </select>
              <div className="inline-flex rounded-full bg-mist p-1">
                {(["Latest", "Closing Soon"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      tab === item ? "bg-white text-forest shadow-sm" : "text-slate"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="relative block max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contracts, agencies, sectors, or tender refs…"
              className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"
            />
          </label>
          {search.trim() ? (
            <p className="text-xs text-slate">
              Showing {rows.length} of {sourceList.length} for “{search.trim()}”
            </p>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-8 text-center text-sm text-slate">Loading tenders…</p>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-xl bg-mist/60 p-8 text-center text-sm text-slate">
            {boardMode === "live" ? (
              <>
                <p>
                  No live contracts match your filters in {stateLabel}.
                  {error ? ` (${error})` : ""}
                </p>
                <p className="mt-2 text-xs">
                  Live contracts appear here when published by a state government
                  or business, or after catalogue data is loaded in the database.
                </p>
                {isBusiness ? (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={openCreate}
                      className="rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy"
                    >
                      Publish your own contract
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p>No reference items match these filters.</p>
            )}
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-navy/8">
            {rows.map((row) => (
              <TenderRow
                key={row.id}
                row={row}
                isBusiness={isBusiness}
                existingBid={bidForTender(row.ref, row.id)}
                onBid={() => openBid(row)}
              />
            ))}
          </ul>
        )}
      </section>

      {activeTender && business && user && (
        <BidModal
          tender={activeTender}
          businessName={business.name}
          contactEmail={user.email}
          existing={bidForTender(activeTender.ref, activeTender.id)}
          onClose={() => setActiveTender(null)}
          onSubmit={async (bid: TenderBid) => {
            submitBid(bid);
            setActiveTender(null);
          }}
        />
      )}

      {createOpen && business && user && (
        <CreateContractModal
          defaultState={selectedState}
          companyName={business.name}
          contactEmail={user.email}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setBoardMode("live");
            void reload();
          }}
        />
      )}
    </div>
  );
}

function TenderRow({
  row,
  isBusiness,
  existingBid,
  onBid,
}: {
  row: TenderItem;
  isBusiness: boolean;
  existingBid?: { status: string };
  onBid: () => void;
}) {
  const publisher = publisherLabel(row.publisherType);

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-forest">{row.ref}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              row.publisherType === "business"
                ? "bg-orange-soft text-navy"
                : "bg-sky-50 text-sky-800"
            }`}
          >
            {publisher}
          </span>
          {row.live ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
              Live
            </span>
          ) : (
            <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate">
              Reference
            </span>
          )}
        </div>
        <p className="mt-0.5 font-medium text-navy">{row.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {row.agency}
          </span>
          <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-800">
            {row.sector}
          </span>
          <span>{row.budget}</span>
          <span
            className={`inline-flex items-center gap-1 font-semibold ${row.urgent ? "text-red-600" : ""}`}
          >
            {row.urgent && <Clock className="h-3 w-3" />}
            {row.deadline}
          </span>
          {existingBid && (
            <span className="rounded-full bg-orange-soft px-2 py-0.5 font-semibold text-forest">
              {existingBid.status === "submitted" ? "Bid submitted" : "Draft saved"}
            </span>
          )}
        </div>
      </div>
      {isBusiness ? (
        row.live ? (
          <button
            type="button"
            onClick={onBid}
            className="shrink-0 rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            {existingBid ? "Update bid" : "Submit bid"}
          </button>
        ) : (
          <span className="shrink-0 text-xs text-slate">Reference only</span>
        )
      ) : (
        <span className="shrink-0 text-xs text-slate">Business accounts only</span>
      )}
    </li>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate">{label}</p>
    </article>
  );
}
