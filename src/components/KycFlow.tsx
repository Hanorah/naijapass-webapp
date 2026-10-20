"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, Lock, Loader2, Shield } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSession } from "@/components/SessionProvider";
import { businessTypes } from "@/data/marketplace";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { safeReturnPath } from "@/lib/returnUrl";

async function postKyc(body: Record<string, unknown>) {
  if (isApiConfigured()) {
    return apiFetch<{ verified?: boolean; error?: string }>("/api/kyc/verify", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
  const res = await fetch("/api/kyc/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as { verified?: boolean; error?: string };
}

export default function KycFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("next"));
  const { ready, user, pending, completeKyc } = useSession();

  useEffect(() => {
    if (!ready) return;
    if (user?.verified) {
      router.replace(returnPath);
      return;
    }
    if (!pending) {
      router.replace("/signup");
    }
  }, [ready, user, pending, router, returnPath]);

  if (!ready || user?.verified || !pending) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-white text-sm text-slate">
        Preparing verification…
      </div>
    );
  }

  const finish = async (extra?: Parameters<typeof completeKyc>[0]) => {
    const verified = await completeKyc(extra);
    if (!verified) {
      toast.error("Could not save your verification. Please try again.");
      return;
    }
    toast.success(
      pending.role === "business"
        ? "Corporate verification submitted. Welcome to the portal."
        : "Verification submitted. We’ll review shortly.",
    );
    router.push(returnPath);
  };

  return (
    <div className="min-h-full flex-1 bg-white px-5 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <NaijaPassMark />
        <p className="eyebrow mb-4 mt-10">Verification</p>
        <h1 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          {pending.role === "business"
            ? "Verify your business"
            : "Verify your identity"}
        </h1>
        <p className="mt-2 text-slate">
          {pending.role === "business"
            ? "Upload CAC and tax documents to join the verified directory and bid for government contracts."
            : "Complete citizen verification to track projects, view businesses, and use the portal."}
        </p>
        <p className="mt-3 text-sm font-medium text-forest">
          Registering as {pending.role === "business" ? "a business" : "an individual"} ·{" "}
          {pending.email}
        </p>

        <div className="mt-6">
          {pending.role === "business" ? (
            <BusinessForm
              defaultName={pending.name}
              onDone={(details) => void finish(details)}
            />
          ) : (
            <IndividualForm onDone={() => void finish()} />
          )}
        </div>
      </div>
    </div>
  );
}

function IndividualForm({ onDone }: { onDone: () => void }) {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [nin, setNin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!idFile) {
      toast.error("Upload a valid ID to continue.");
      return;
    }
    if (!first || !last) {
      toast.error("Enter your first and last name.");
      return;
    }
    if (!/^\d{11}$/.test(nin.trim())) {
      toast.error("NIN must be 11 digits.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await postKyc({
        type: "individual",
        nin: nin.trim(),
        firstName: first.trim(),
        lastName: last.trim(),
      });
      if (!data.verified) {
        toast.error(data.error ?? "Verification failed.");
        return;
      }
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach verification service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-navy/8 bg-white p-6 shadow-sm md:p-8"
    >
      <h2 className="font-display text-xl font-bold text-navy">
        Individual Verification
      </h2>

      <div className="mt-6">
        <p className="text-sm font-bold text-navy">Upload Valid ID</p>
        <p className="mt-1 text-sm text-slate">
          NIN Slip, Driver’s License, or International Passport.
        </p>
        <div className="mt-3">
          <FileDropzone
            accept=".svg,.png,.jpg,.jpeg,.pdf"
            maxMb={5}
            hint="SVG, PNG, JPG or PDF (max. 5MB)"
            icon="cloud"
            file={idFile}
            onFile={setIdFile}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-navy">
          First Name
          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="e.g. Adebayo"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </label>
        <label className="block text-sm font-bold text-navy">
          Last Name
          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            placeholder="e.g. Okafor"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold text-navy">
        NIN (National Identity Number)
        <input
          value={nin}
          onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
          placeholder="Enter 11-digit NIN"
          inputMode="numeric"
          className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008751] py-3.5 text-sm font-semibold text-white transition hover:bg-[#006b41] disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            Submit for Verification
            <Shield className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate">
        <Lock className="h-3.5 w-3.5" />
        Your data is securely encrypted and stored.
      </p>
    </form>
  );
}

function BusinessForm({
  defaultName,
  onDone,
}: {
  defaultName: string;
  onDone: (details: { businessType: string; rcNumber: string }) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [businessName, setBusinessName] = useState(defaultName);
  const [businessType, setBusinessType] = useState("");
  const [rc, setRc] = useState("");
  const [tcc, setTcc] = useState<File | null>(null);
  const [tin, setTin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goToDocuments = (e: FormEvent) => {
    e.preventDefault();
    if (!certificate) {
      toast.error("Upload your certificate of incorporation.");
      return;
    }
    if (!businessName.trim() || !businessType) {
      toast.error("Enter your business name and type.");
      return;
    }
    if (!rc.trim()) {
      toast.error("Enter your RC Number.");
      return;
    }
    setStep(2);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!tcc) {
      toast.error("Upload a tax clearance certificate.");
      return;
    }
    if (!/^\d{14}$/.test(tin.trim())) {
      toast.error("TIN must be 14 digits.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await postKyc({
        type: "business",
        rcNumber: rc.trim(),
        tin: tin.trim(),
        businessName: businessName.trim(),
      });
      if (!data.verified) {
        toast.error(data.error ?? "Verification failed.");
        return;
      }
      onDone({ businessType, rcNumber: rc.trim() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach verification service.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <form
        onSubmit={goToDocuments}
        className="rounded-2xl border border-navy/8 bg-white p-6 shadow-sm md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-forest">
          Step 1 of 2
        </p>
        <h2 className="mt-1 font-display text-xl font-bold text-navy">
          Business Verification
        </h2>

        <div className="mt-6">
          <p className="text-sm font-bold text-navy">
            Certificate of Incorporation
          </p>
          <p className="mt-1 text-sm text-slate">
            Certificate of Incorporation, CAC status report, or Tax ID document.
          </p>
          <div className="mt-3">
            <FileDropzone
              accept=".pdf,.jpg,.jpeg,.png"
              maxMb={10}
              hint="PDF, JPG or PNG (max. 10MB)"
              icon="doc"
              file={certificate}
              onFile={setCertificate}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Business Name
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Construction Ltd"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
            />
          </label>
          <label className="block text-sm font-bold text-navy">
            Business Type
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
            >
              <option value="">Select type...</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-navy">
          RC Number
          <input
            value={rc}
            onChange={(e) => setRc(e.target.value)}
            placeholder="e.g. RC1234567"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </label>

        <button
          type="submit"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008751] py-3.5 text-sm font-semibold text-white transition hover:bg-[#006b41]"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate">
          <Lock className="h-3.5 w-3.5" />
          Your data is securely encrypted and stored.
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-navy/8 bg-white p-6 shadow-sm md:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-forest">
        Step 2 of 2
      </p>
      <h2 className="mt-1 font-display text-xl font-bold text-navy">
        Corporate Documents
      </h2>

      <div className="mt-6">
        <p className="text-sm font-bold text-navy">CAC Registration Certificate</p>
        <p className="mt-1 text-sm text-slate">
          Upload your official Corporate Affairs Commission certificate (CAC 2
          or CAC 7).
        </p>
        <div className="mt-3">
          <FileDropzone
            accept=".pdf,.jpg,.jpeg,.png"
            maxMb={10}
            hint="PDF, JPG or PNG (max. 10MB)"
            icon="doc"
            file={certificate}
            onFile={setCertificate}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold text-navy">
          Tax Clearance Certificate (TCC)
        </p>
        <p className="mt-1 text-sm text-slate">
          Valid tax clearance for the last three years.
        </p>
        <div className="mt-3">
          <FileDropzone
            accept=".pdf"
            maxMb={5}
            hint="PDF only (max. 5MB)"
            icon="receipt"
            file={tcc}
            onFile={setTcc}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-navy">
          RC Number
          <input
            value={rc}
            readOnly
            className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
          />
        </label>
        <label className="block text-sm font-bold text-navy">
          Tax Identification Number (TIN)
          <input
            value={tin}
            onChange={(e) => setTin(e.target.value.replace(/\D/g, "").slice(0, 14))}
            placeholder="Enter 14-digit TIN"
            inputMode="numeric"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </label>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm font-semibold text-navy hover:text-orange"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#008751] px-5 py-3 text-sm font-semibold text-white hover:bg-[#006b41] disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit for Verification
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
