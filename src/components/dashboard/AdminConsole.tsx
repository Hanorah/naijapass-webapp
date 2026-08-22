"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Shield,
  Store,
  Users,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { directoryUsers } from "@/data/users";
import { roleLabels } from "@/lib/session";
import { marketplaceCategories, stateDisplayName } from "@/data/marketplace";

export default function AdminConsole() {
  const { user, listings, setListingStatus } = useSession();

  const stats = useMemo(() => {
    const people = directoryUsers;
    return [
      {
        label: "Verified users",
        value: people.filter((item) => item.status === "verified").length,
        icon: Users,
      },
      {
        label: "Businesses",
        value: people.filter((item) => item.role === "business").length,
        icon: Building2,
      },
      {
        label: "Live listings",
        value: listings.filter((item) => item.status === "live").length,
        icon: Store,
      },
      {
        label: "Pending reviews",
        value:
          people.filter((item) => item.status === "pending").length +
          listings.filter((item) => item.status === "pending").length,
        icon: Shield,
      },
    ];
  }, [listings]);

  if (user?.role !== "admin") {
    return (
      <div className="px-4 py-16 text-center text-slate">
        Admin access is required to manage the portal.
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
        Admin console
      </h1>
      <p className="mt-1 text-slate">
        Manage accounts, verifications, and marketplace listings across NaijaPass.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm"
            >
              <Icon className="h-5 w-5 text-forest" />
              <p className="mt-3 font-display text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-slate">{stat.label}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold">Accounts</h2>
          <p className="text-sm text-slate">
            Individual, business, government, and admin roles.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="pb-2 font-semibold">Name</th>
                  <th className="pb-2 font-semibold">Role</th>
                  <th className="pb-2 font-semibold">State</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {directoryUsers.map((account) => (
                  <tr key={account.id} className="border-t border-navy/8">
                    <td className="py-3">
                      <p className="font-semibold">{account.name}</p>
                      <p className="text-xs text-slate">{account.email}</p>
                    </td>
                    <td className="py-3">{roleLabels[account.role]}</td>
                    <td className="py-3">{stateDisplayName(account.state)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          account.status === "verified"
                            ? "bg-emerald-50 text-forest"
                            : account.status === "pending"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {account.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold">Marketplace listings</h2>
          <p className="text-sm text-slate">
            Hide, restore, or keep vendor storefronts live.
          </p>
          <ul className="mt-4 space-y-3">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy/8 p-3"
              >
                <div>
                  <p className="font-semibold">{listing.name}</p>
                  <p className="text-xs text-slate">
                    {
                      marketplaceCategories.find((cat) => cat.id === listing.category)
                        ?.label
                    }{" "}
                    · {stateDisplayName(listing.state)} · {listing.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {listing.status !== "live" && (
                    <button
                      type="button"
                      onClick={() => {
                        setListingStatus(listing.id, "live");
                        toast.success(`${listing.name} is live.`);
                      }}
                      className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Publish
                    </button>
                  )}
                  {listing.status !== "hidden" && (
                    <button
                      type="button"
                      onClick={() => {
                        setListingStatus(listing.id, "hidden");
                        toast.success(`${listing.name} hidden from the hub.`);
                      }}
                      className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
