"use client";

import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";
import { nigerianStates } from "@/data/states";
import {
  directoryCategories,
  directoryLgasByState,
  type DirectoryCategory,
} from "@/data/businesses";
import { stateDisplayName } from "@/data/marketplace";
import type { MyBusiness, SaveMyBusinessInput } from "@/lib/db/myBusiness";

type Props = {
  defaultState: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  existing?: MyBusiness | null;
  onClose: () => void;
  onSave: (input: SaveMyBusinessInput) => Promise<{ error: string | null }>;
};

export default function BusinessProfileEditor({
  defaultState,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  existing,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(existing?.name ?? defaultName);
  const [category, setCategory] = useState<DirectoryCategory>(
    existing?.category ?? "professional",
  );
  const [subcategory, setSubcategory] = useState(existing?.subcategory ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? defaultPhone);
  const [email, setEmail] = useState(existing?.email ?? defaultEmail);
  const [website, setWebsite] = useState(existing?.website ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [imagePreview, setImagePreview] = useState(existing?.image ?? "");
  const [state, setState] = useState(existing?.state ?? defaultState);
  const [lga, setLga] = useState(
    existing?.lga ??
      directoryLgasByState[defaultState]?.find((item) => item !== "All LGAs") ??
      "Oredo",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!directoryLgasByState[state]?.includes(lga)) {
      setLga(directoryLgasByState[state]?.[1] ?? "Oredo");
    }
  }, [state, lga]);

  const lgas = (directoryLgasByState[state] ?? ["All LGAs"]).filter(
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subcategory.trim()) {
      toast.error("Enter your company name and primary service.");
      return;
    }
    if (website.trim() && !/^https?:\/\//i.test(website.trim())) {
      toast.error("Website must start with http:// or https://");
      return;
    }
    setSaving(true);
    const result = await onSave({
      name: name.trim(),
      category,
      subcategory: subcategory.trim(),
      state,
      lga,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      description: description.trim(),
      services: [subcategory.trim()],
      image: imagePreview || undefined,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      existing
        ? "Business profile updated. Pending review if changed."
        : "Business profile submitted for verification.",
    );
    onClose();
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
              {existing ? "Edit business profile" : "Set up your business"}
            </h2>
            <p className="mt-1 text-sm text-slate">
              One verified company profile for the directory, Market Hub, and
              procurement bids.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-slate" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold text-navy">
          Company logo / cover
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
          Registered company name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-navy">
          About your company
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What your company delivers for public and private clients…"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DirectoryCategory)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {directoryCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            Primary service
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Civil engineering"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-navy">
          Business address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, city"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 …"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
          <label className="block text-sm font-bold text-navy">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-navy">
          Website
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.ng"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            State
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {nigerianStates.map((item) => (
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
            disabled={saving}
            className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
          >
            {saving ? "Saving…" : existing ? "Save profile" : "Submit profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
