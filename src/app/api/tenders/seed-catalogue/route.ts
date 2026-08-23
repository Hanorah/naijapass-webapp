import { NextResponse } from "next/server";
import { federalTenders } from "@/data/federalTenders";
import { procurementRecords } from "@/data/procurement";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

type TenderPayload = {
  title: string;
  reference: string;
  mda: string;
  state: string | null;
  sector: string;
  value: number | null;
  currency: string;
  deadline: string | null;
  status: "open";
  description: string | null;
  source: string | null;
  document_url: string | null;
  published_at: string;
  publisher_type: string;
  lga?: string | null;
  contact_email?: string | null;
};

/**
 * Upserts researched tenders into public.tenders for the Live board:
 * - Federal / state NOCOPO catalogue (federalTenders.ts)
 * - Edo LGA & state procurement records (procurement.ts)
 */
export async function POST() {
  if (!hasServiceRole()) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to .env.local or run supabase/seed-tenders.sql.",
      },
      { status: 500 },
    );
  }

  const admin = createAdminClient();
  const payloads: TenderPayload[] = [];

  for (const tender of federalTenders.filter((t) => t.status === "open")) {
    payloads.push({
      title: tender.title,
      reference: tender.reference,
      mda: tender.mda,
      state: tender.state,
      sector: tender.sector,
      value: tender.value > 0 ? tender.value : null,
      currency: "NGN",
      deadline: tender.deadline ? new Date(tender.deadline).toISOString() : null,
      status: "open",
      description: `Sourced from ${tender.source.toUpperCase()} research catalogue.`,
      source: tender.sourceUrl ?? tender.source,
      document_url: tender.sourceUrl ?? null,
      published_at: tender.publishedAt
        ? new Date(tender.publishedAt).toISOString()
        : new Date().toISOString(),
      publisher_type: tender.state ? "govt" : "federal",
    });
  }

  for (const record of procurementRecords.filter(
    (r) => r.active === "Yes" && r.contractorOrigin === "Edo",
  )) {
    const slug = slugify(record.procuringEntity || record.title);
    const value =
      record.contractAmount > 0
        ? record.contractAmount
        : record.tenderAmount > 0
          ? record.tenderAmount
          : null;
    payloads.push({
      title: `${record.procuringEntity} — ${record.category}`,
      reference: `EDO/${record.value}/${slug}`.toUpperCase(),
      mda: record.procuringEntity,
      state: "Edo",
      lga: record.location || null,
      sector: record.category,
      value,
      currency: "NGN",
      deadline: new Date(`${record.year}-12-31`).toISOString(),
      status: "open",
      description: `Edo state procurement record (${record.body}). Status: ${record.status}. Sourced from public procurement research.`,
      source: "edo-ocds",
      document_url: record.email ? `mailto:${record.email}` : null,
      contact_email: record.email || null,
      published_at: record.awardDate
        ? new Date(record.awardDate).toISOString()
        : new Date().toISOString(),
      publisher_type: "govt",
    });
  }

  const { data: existing, error: existingError } = await admin
    .from("tenders")
    .select("id, reference")
    .not("reference", "is", null);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const byRef = new Map(
    (existing ?? [])
      .filter((r) => r.reference)
      .map((r) => [String(r.reference).toLowerCase(), r.id as string]),
  );

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const payload of payloads) {
    const { error } = await admin.from("tenders").upsert(payload, { onConflict: "reference" });
    if (error) {
      errors.push(`${payload.reference}: ${error.message}`);
      continue;
    }
    const existingId = byRef.get(payload.reference.toLowerCase());
    if (existingId) updated += 1;
    else inserted += 1;
  }

  return NextResponse.json({
    ok: true,
    inserted,
    updated,
    totalCatalogue: payloads.length,
    federalOpen: federalTenders.filter((t) => t.status === "open").length,
    edoActive: procurementRecords.filter(
      (r) => r.active === "Yes" && r.contractorOrigin === "Edo",
    ).length,
    errors: errors.slice(0, 8),
  });
}

export async function GET() {
  return POST();
}
