"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";
import {
  marketplaceCategories,
  marketplaceLgas,
  stateDisplayName,
  type MarketplaceCategory,
  type MarketplaceListing,
  type WebsiteMode,
} from "@/data/marketplace";

type Props = {
  defaultState: string;
  defaultName?: string;
  ownerEmail?: string;
  onClose: () => void;
  onCreate: (listing: MarketplaceListing) => void;
};

export default function ListingComposer({
  defaultState,
  defaultName = "",
  ownerEmail,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState<MarketplaceCategory>("construction");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteMode, setWebsiteMode] = useState<WebsiteMode>("url");
  const [website, setWebsite] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [state, setState] = useState(
    marketplaceLgas[defaultState] ? defaultState : "Edo",
  );
  const [lga, setLga] = useState(
    marketplaceLgas[defaultState]?.[1] ??
      marketplaceLgas.Edo?.[1] ??
      "Oredo",
  );
  const lgas = (marketplaceLgas[state] ?? ["All LGAs"]).filter(
    (item) => item !== "All LGAs",
  );

  const onImage = (file: File | null) => {
    if (!file) {
      setImagePreview("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subcategory.trim()) {
      toast.error("Enter a business name and service category.");
      return;
    }
    if (websiteMode === "url" && website.trim() && !/^https?:\/\//i.test(website.trim())) {
      toast.error("Website must start with http:// or https://");
      return;
    }
    onCreate({
      id: `listing-${Date.now()}`,
      name: name.trim(),
      category,
      subcategory: subcategory.trim(),
      rating: 0,
      reviews: 0,
      location: `${lga}, ${stateDisplayName(state)}`,
      state,
      lga,
      distance: "0.2 km",
      integrated: true,
      verified: true,
      ownerEmail,
      status: "pending",
      description: description.trim() || undefined,
      phone: phone.trim() || undefined,
      websiteMode,
      website: websiteMode === "url" ? website.trim() || undefined : undefined,
      services: [subcategory.trim()],
      image: imagePreview || undefined,
    });
    if (websiteMode === "request-build") {
      toast.success("We'll reach out about building your business website.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">
              Publish business listing
            </h2>
            <p className="mt-1 text-sm text-slate">
              Add your company to Market Hub and the verified directory.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-slate" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold text-navy">
          Cover image
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-mist sm:w-40">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate">
                  No image
                </div>
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-navy/20 px-4 py-3 text-sm font-semibold text-forest hover:bg-mist">
              <ImagePlus className="h-4 w-4" />
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => onImage(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </label>

        <label className="mt-4 block text-sm font-bold text-navy">
          Business name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-navy">
          About your business
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What you deliver for public and private clients…"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {marketplaceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            Service
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Road construction"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-navy">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 …"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-navy">Website</legend>
          <div className="mt-2 space-y-2">
            {(
              [
                ["url", "I have a website", "Add your live URL to the profile."],
                [
                  "request-build",
                  "Request NaijaPass to build it",
                  "We'll follow up to ship a business site for you.",
                ],
                ["none", "Skip for now", ""],
              ] as const
            ).map(([mode, title, hint]) => (
              <label
                key={mode}
                className="flex cursor-pointer items-start gap-2 rounded-xl border border-navy/10 p-3 text-sm"
              >
                <input
                  type="radio"
                  name="websiteMode"
                  checked={websiteMode === mode}
                  onChange={() => setWebsiteMode(mode)}
                  className="mt-1 accent-forest"
                />
                <span>
                  <span className="font-semibold text-navy">{title}</span>
                  {hint ? (
                    <span className="mt-0.5 block text-slate">{hint}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
          {websiteMode === "url" && (
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.ng"
              className="mt-3 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-forest/15"
            />
          )}
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            State
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setLga(marketplaceLgas[e.target.value]?.[1] ?? "Oredo");
              }}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {Object.keys(marketplaceLgas).map((item) => (
                <option key={item} value={item}>
                  {stateDisplayName(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            LGA
            <select
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {lgas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Publish listing
          </button>
        </div>
      </form>
    </div>
  );
}
