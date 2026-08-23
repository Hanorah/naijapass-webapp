"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Clock, ExternalLink, FileText, MapPin } from "lucide-react";
import BidModal from "@/components/dashboard/BidModal";
import { useSession } from "@/components/SessionProvider";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useMyBusiness } from "@/lib/db/myBusiness";
import { useTenders, type TenderItem } from "@/lib/db/tenders";
import { stateDisplayName } from "@/data/marketplace";

type SectorFilter = "All" | string;

export default function ProcurementIntel() {
  const { user, submitBid, bidForTender } = useSession();
  const { selectedState } = useDashboardSearch();
  const { tenders, loading, source } = useTenders(selectedState);
  const { business } = useMyBusiness(user?.id, user?.email);
  const isBusiness = user?.role === "business" || user?.role === "admin";
  const [tab, setTab] = useState<"Latest" | "Closing Soon">("Latest");
  const [sector, setSector] = useState<SectorFilter>("All");
  const [activeTender, setActiveTender] = useState<TenderItem | null>(null);

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(tenders.map((t) => t.sector))).sort()],
    [tenders],
  );

  const rows = useMemo(() => {
    let list = sector === "All" ? tenders : tenders.filter((t) => t.sector === sector);
    if (tab === "Closing Soon") {
      list = [...list].sort(
        (a, b) => Number(b.urgent) - Number(a.urgent) || a.deadline.localeCompare(b.deadline),
      );
    }
    return list;
  }, [tenders, sector, tab]);

  const stateLabel = stateDisplayName(selectedState);
  const totalValue = tenders.reduce((sum, t) => {
    const match = t.budget.match(/[\d.]+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0);

  const openBid = (tender: TenderItem) => {
    if (!isBusiness) {
      toast.error("Register as a business to submit bids.");
      return;
    }
    if (!user?.verified) {
      toast.error("Complete KYC verification before bidding.");
      return;
    }
    if (!business) {
      toast.error("Set up your business profile first — Profile → Set up business.");
      return;
    }
    setActiveTender(tender);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Procurement
          </h1>
          <p className="mt-1 max-w-2xl text-slate">
            Open tenders for {stateLabel}
            {source === "seed" ? " (reference catalogue)" : ""}.
            {isBusiness
              ? " Submit bids using your registered company profile."
              : " Register as a business to submit bids."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBusiness ? (
            <Link
              href="/dashboard/profile"
              className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              {business ? "Manage business profile" : "Set up business profile"}
            </Link>
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
            Public procurement board
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi value={String(tenders.length)} label="Open in your state" />
        <Kpi
          value={tenders.filter((t) => t.urgent).length.toString()}
          label="Closing within 7 days"
        />
        <Kpi value={totalValue > 0 ? `${totalValue.toFixed(0)}B+ NGN` : "—"} label="Combined est. value" />
      </div>

      <section className="mt-6 rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
            <FileText className="h-4 w-4" /> Open tenders
          </h2>
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

        {loading ? (
          <p className="mt-8 text-center text-sm text-slate">Loading tenders…</p>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-xl bg-mist/60 p-8 text-center text-sm text-slate">
            No open tenders match these filters for {stateLabel}. Try another sector or
            change your state from the header.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-navy/8">
            {rows.map((row) => (
              <TenderRow
                key={row.id}
                row={row}
                isBusiness={isBusiness}
                existingBid={bidForTender(row.ref)}
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
          existing={bidForTender(activeTender.ref)}
          onClose={() => setActiveTender(null)}
          onSubmit={(bid) => {
            submitBid(bid);
            setActiveTender(null);
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
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-forest">{row.ref}</p>
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
          <span className={`inline-flex items-center gap-1 font-semibold ${row.urgent ? "text-red-600" : ""}`}>
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
        <button
          type="button"
          onClick={onBid}
          className="shrink-0 rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-hover"
        >
          {existingBid ? "Update bid" : "Start bid"}
        </button>
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
