"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  Store,
  UserRound,
} from "lucide-react";
import InitialsAvatar from "@/components/InitialsAvatar";
import BusinessProfileEditor from "@/components/dashboard/BusinessProfileEditor";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useSession } from "@/components/SessionProvider";
import { apiFetch } from "@/lib/api/client";
import { useMyBusiness } from "@/lib/db/myBusiness";
import { useIncomingBids, useMyPublishedContracts } from "@/lib/db/procurement";
import { useTenders } from "@/lib/db/tenders";
import { initials, roleLabels } from "@/lib/session";
import { stateDisplayName } from "@/data/marketplace";
import { directoryCategories } from "@/data/businesses";

export default function ProfileView() {
  const { user, saveProfile, tenderBids } = useSession();
  const { selectedState } = useDashboardSearch();
  const displayName = user?.name ?? "Guest";
  const role = user?.role ?? "individual";
  const isBusiness = role === "business" || role === "admin";
  const homeState = user?.state ?? selectedState;

  const { liveTenders } = useTenders(selectedState);
  const {
    business,
    loading: businessLoading,
    save,
    setVisibility,
    reload,
  } = useMyBusiness(user?.id, user?.email);
  const {
    contracts: publishedContracts,
    loading: contractsLoading,
    reload: reloadContracts,
  } = useMyPublishedContracts(isBusiness);
  const {
    bids: incomingBids,
    loading: incomingLoading,
    reload: reloadIncoming,
  } = useIncomingBids(isBusiness);
  const [editing, setEditing] = useState(false);
  const [editor, setEditor] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [state, setState] = useState(user?.state ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setState(user?.state ?? "");
  }, [user]);

  const myBids = useMemo(
    () => (tenderBids ?? []).filter((bid) => bid.contactEmail === user?.email),
    [tenderBids, user?.email],
  );

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const result = await saveProfile({ name: name.trim() || displayName, phone, state });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated.");
    setEditing(false);
  };

  const categoryLabel =
    business &&
    (directoryCategories.find((c) => c.id === business.category)?.label ??
      business.category);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            {isBusiness ? "Business workspace" : "Your profile"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate md:text-[15px]">
            {isBusiness
              ? "One company profile for the directory, Market Hub, and procurement bids."
              : "Identity, verification, and how you appear across the portal."}
          </p>
        </div>
        {isBusiness && (
          <button
            type="button"
            onClick={() => setEditor(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            <Pencil className="h-4 w-4" />
            {business ? "Edit business profile" : "Set up business profile"}
          </button>
        )}
      </div>

      {isBusiness ? (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard
              label="Business profile"
              value={
                businessLoading
                  ? "…"
                  : business
                    ? business.status === "live"
                      ? "Live"
                      : "Pending"
                    : "Not set"
              }
            />
            <MetricCard label="Open tenders" value={String(liveTenders.length)} />
            <MetricCard
              label="Published contracts"
              value={contractsLoading ? "…" : String(publishedContracts.length)}
            />
            <MetricCard
              label="Submitted bids"
              value={String(myBids.filter((b) => b.status === "submitted").length)}
            />
            <MetricCard
              label="Bids received"
              value={incomingLoading ? "…" : String(incomingBids.length)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <BusinessAction
              href="/dashboard/directory"
              icon={Building2}
              title="Directory"
              body="How the public sees your verified company."
            />
            <BusinessAction
              href="/dashboard/marketplace"
              icon={Store}
              title="Market Hub"
              body="Browse suppliers and open your public profile."
            />
            <BusinessAction
              href="/dashboard/procurement"
              icon={BadgeCheck}
              title="Procurement"
              body="Bid on live contracts or publish your own RFP."
            />
          </div>

          <section className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl tracking-tight">Your business</h2>
                <p className="mt-1 text-sm text-slate">
                  One registered company 
                </p>
              </div>
              {business?.id && !business.id.startsWith("local-") ? (
                <Link
                  href={`/dashboard/directory/${business.id}`}
                  className="text-sm font-semibold text-forest"
                >
                  View public profile
                </Link>
              ) : null}
            </div>

            {businessLoading ? (
              <p className="mt-6 text-sm text-slate">Loading business profile…</p>
            ) : !business ? (
              <p className="mt-6 rounded-2xl border border-dashed border-navy/12 bg-mist/50 p-8 text-center text-sm text-slate">
                Set up your company profile to appear in the directory and bid on
                government contracts.
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                <InitialsAvatar
                  name={business.name}
                  src={business.image}
                  size={72}
                  rounded="2xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">{business.name}</p>
                  <p className="text-sm text-slate">
                    {categoryLabel} · {business.subcategory}
                  </p>
                  <p className="mt-1 text-sm text-slate">
                    {business.address || `${business.lga}, ${stateDisplayName(business.state)}`}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate">
                    Status: {business.status}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditor(true)}
                      className="rounded-xl border border-navy/10 px-3 py-2 text-xs font-semibold text-navy hover:bg-mist"
                    >
                      Edit profile
                    </button>
                    {business.status === "live" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await setVisibility("hidden");
                          if (result.error) toast.error(result.error);
                          else toast.success("Business hidden from directory.");
                        }}
                        className="rounded-xl border border-navy/10 px-3 py-2 text-xs font-semibold text-navy hover:bg-mist"
                      >
                        Hide from directory
                      </button>
                    ) : business.status === "hidden" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await setVisibility("live");
                          if (result.error) toast.error(result.error);
                          else toast.success("Business is live in directory.");
                        }}
                        className="rounded-xl border border-navy/10 px-3 py-2 text-xs font-semibold text-navy hover:bg-mist"
                      >
                        Show in directory
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl tracking-tight">Published contracts</h2>
                <p className="mt-1 text-sm text-slate">
                  RFPs you posted for other businesses to bid on.
                </p>
              </div>
              <Link href="/dashboard/procurement" className="text-sm font-semibold text-forest">
                Publish new
              </Link>
            </div>
            {contractsLoading ? (
              <p className="mt-5 text-sm text-slate">Loading…</p>
            ) : publishedContracts.length === 0 ? (
              <p className="mt-5 text-sm text-slate">
                No contracts published yet. Open Procurement → Publish contract.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-navy/8">
                {publishedContracts.map((contract) => (
                  <li
                    key={contract.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-navy">{contract.reference ?? contract.id.slice(0, 8)}</p>
                      <p className="text-sm text-slate">{contract.title}</p>
                      <p className="text-xs text-slate">
                        {contract.sector} · {contract.state} · {contract.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await apiFetch("/api/tenders", {
                            method: "POST",
                            body: JSON.stringify({
                              id: contract.id,
                              title: contract.title,
                              reference: contract.reference ?? undefined,
                              sector: contract.sector ?? undefined,
                              state: contract.state ?? selectedState,
                              value: contract.value ?? undefined,
                              deadline: contract.deadline
                                ? contract.deadline.slice(0, 19).replace("T", " ")
                                : undefined,
                              status: "closed",
                              publisher_type: "business",
                            }),
                          });
                          toast.success("Contract closed.");
                          void reloadContracts();
                          void reloadIncoming();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Could not close contract.");
                        }
                      }}
                      className="shrink-0 rounded-xl border border-navy/10 px-3 py-2 text-xs font-semibold text-navy hover:bg-mist"
                    >
                      Close listing
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl tracking-tight">Bids on your contracts</h2>
                <p className="mt-1 text-sm text-slate">
                  Submissions from other businesses on contracts you published.
                </p>
              </div>
            </div>
            {incomingLoading ? (
              <p className="mt-5 text-sm text-slate">Loading…</p>
            ) : incomingBids.length === 0 ? (
              <p className="mt-5 text-sm text-slate">
                No bids received yet. Publish a contract in Procurement to start receiving bids.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-navy/8">
                {incomingBids.map((bid) => (
                  <li
                    key={bid.id}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-navy">
                        {bid.tenders?.reference ?? bid.tender_id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate">{bid.tenders?.title ?? "Contract"}</p>
                      <p className="text-sm font-medium text-navy">{bid.business_name}</p>
                      <p className="text-xs text-slate">
                        NGN {bid.proposed_amount?.toLocaleString("en-NG") ?? "—"} ·{" "}
                        {bid.contact_email}
                      </p>
                      {bid.notes ? (
                        <p className="mt-1 text-xs text-slate line-clamp-2">{bid.notes}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-forest">
                        {bid.status}
                      </span>
                      {bid.status === "submitted" || bid.status === "draft" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await apiFetch(`/api/tenders/${bid.tender_id}/bids/${bid.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ status: "accepted" }),
                                });
                              } catch (err) {
                                toast.error(
                                  err instanceof Error ? err.message : "Could not update bid.",
                                );
                                return;
                              }
                              toast.success("Bid accepted. Bidder will be notified if email is set up.");
                              void reloadIncoming();
                            }}
                            className="rounded-xl bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-hover"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await apiFetch(`/api/tenders/${bid.tender_id}/bids/${bid.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ status: "rejected" }),
                                });
                              } catch (err) {
                                toast.error(
                                  err instanceof Error ? err.message : "Could not update bid.",
                                );
                                return;
                              }
                              toast.success("Bid rejected.");
                              void reloadIncoming();
                            }}
                            className="rounded-xl border border-navy/10 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-mist"
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl tracking-tight">Your bids</h2>
              <Link href="/dashboard/procurement" className="text-sm font-semibold text-forest">
                Find tenders
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate">
              Bids you submitted on government and business contracts.
            </p>
            {myBids.length === 0 ? (
              <p className="mt-5 text-sm text-slate">
                No bids yet. Open procurement and submit from a tender row.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-navy/8">
                {myBids.map((bid) => (
                  <li key={bid.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-navy">{bid.tenderRef}</p>
                      <p className="text-sm text-slate">{bid.tenderTitle}</p>
                      <p className="text-xs text-slate">NGN {bid.proposedAmount}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-forest">
                      {bid.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[28px] bg-navy p-7 text-white md:p-8">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest text-lg font-bold">
            {initials(displayName)}
          </span>
          <h2 className="mt-5 font-serif text-3xl tracking-tight">{displayName}</h2>
          <p className="mt-1 text-sm text-white/50">
            {isBusiness ? "Registered business account" : roleLabels[role]}
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-2 text-white/75">
              <Mail className="h-4 w-4 text-forest" />
              {user?.email ?? "—"}
            </p>
            <p className="flex items-center gap-2 text-white/75">
              <Phone className="h-4 w-4 text-forest" />
              {user?.phone || "No phone on file"}
            </p>
            <p className="flex items-center gap-2 text-white/75">
              <MapPin className="h-4 w-4 text-forest" />
              {user?.state || "State not set"}
            </p>
          </div>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5 text-forest" />
            {user?.verified ? "Tier 1 verified" : "Verification pending"}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl tracking-tight">Account details</h3>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="text-sm font-semibold text-forest"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {editing ? (
              <form onSubmit={onSave} className="mt-5 space-y-4">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Display name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Home state</span>
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
                  />
                </label>
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </form>
            ) : (
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Role" value={roleLabels[role]} />
                <Field label="Email" value={user?.email ?? "—"} />
                <Field label="Phone" value={user?.phone || "—"} />
                <Field label="State" value={user?.state || "—"} />
                {user?.rcNumber && <Field label="RC number" value={user.rcNumber} />}
                {user?.businessType && (
                  <Field label="Business type" value={user.businessType} />
                )}
              </dl>
            )}
          </article>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={BadgeCheck} label="Status" value={user?.verified ? "Verified" : "Pending"} />
            <Stat icon={UserRound} label="Access" value={roleLabels[role]} />
            <Stat icon={Building2} label="Workspace" value={user?.state || "National"} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/settings" className="btn btn-primary">
              Open settings
            </Link>
            {!user?.verified ? (
              <Link href="/kyc" className="btn btn-ghost">
                Complete verification
              </Link>
            ) : (
              <Link href="/dashboard/help" className="btn btn-ghost">
                Help Center
              </Link>
            )}
          </div>
        </div>
      </div>

      {editor && isBusiness && (
        <BusinessProfileEditor
          ownerId={user?.id}
          defaultState={homeState}
          defaultName={user?.name ?? ""}
          defaultEmail={user?.email ?? ""}
          defaultPhone={user?.phone ?? ""}
          existing={business}
          onClose={() => setEditor(false)}
          onSave={async (input) => {
            const result = await save(input, { verified: Boolean(user?.verified) });
            if (!result.error) void reload();
            return { error: result.error };
          }}
        />
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[20px] bg-white p-4 ring-1 ring-navy/6">
      <p className="text-xs uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-1 font-serif text-2xl tracking-tight text-navy">{value}</p>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function BusinessAction({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: typeof Building2;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] bg-white p-5 ring-1 ring-navy/6 transition hover:-translate-y-0.5 hover:ring-forest/25"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-mist text-forest">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-forest">
        Open
        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[20px] bg-white p-4 ring-1 ring-navy/6">
      <Icon className="h-4 w-4 text-forest" />
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </article>
  );
}
