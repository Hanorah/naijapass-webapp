import { NextResponse } from "next/server";
import { stateProfiles } from "@/data/stateProfiles";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ContentInsert = {
  state: string;
  type: "law" | "mda" | "emergency" | "service";
  title: string;
  body: string | null;
  contact: string | null;
  phone: string | null;
  category: string | null;
  url?: string | null;
  published: boolean;
};

/**
 * One-time bootstrap: copies the bundled state profiles (ministries, emergency
 * numbers and known laws) into state_content so the State Hub is populated for
 * all 37 states before any government signs in. States can then edit or
 * replace these entries from their own portal.
 *
 * Idempotent: skips any (state, type, title) that already exists.
 */
export async function POST() {
  if (!hasServiceRole()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  // Verify the caller is an admin before using the service-role key.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.account_status !== "active") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("state_content")
    .select("state, type, title");

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const seen = new Set(
    (existing ?? []).map((row) => `${row.state}|${row.type}|${row.title}`),
  );

  const rows: ContentInsert[] = [];
  const push = (row: ContentInsert) => {
    const key = `${row.state}|${row.type}|${row.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  };

  for (const profileEntry of Object.values(stateProfiles)) {
    const {
      state,
      emergency,
      mdas,
      laws,
      officialPortal,
      procurementPortal,
      governor,
      party,
    } = profileEntry;

    if (officialPortal) {
      push({
        state,
        type: "service",
        title: `${state} official government website`,
        body: `Verified portal for ${state} executive announcements, directories and citizen services.`,
        contact: governor,
        phone: null,
        category: "Portal",
        url: officialPortal,
        published: true,
      });
    }

    if (procurementPortal) {
      push({
        state,
        type: "service",
        title: `${state} open procurement portal`,
        body: `Browse active tenders and contractor registration for ${state}.`,
        contact: party ? `${party} administration` : null,
        phone: null,
        category: "Procurement",
        url: procurementPortal,
        published: true,
      });
    }

    const emergencyLines: [string, string][] = [
      ["National Emergency Line", emergency.national],
      [`${state} Police Command`, emergency.police],
      [`${state} Fire Service`, emergency.fire],
      [`${state} Ambulance / SEMA`, emergency.ambulance],
    ];

    for (const [title, phone] of emergencyLines) {
      push({
        state,
        type: "emergency",
        title,
        body: null,
        contact: null,
        phone,
        category: "Emergency",
        published: true,
      });
    }

    for (const mda of mdas) {
      push({
        state,
        type: "mda",
        title: mda.name,
        body: mda.focus,
        contact: mda.name,
        phone: mda.phone,
        category: mda.focus,
        published: true,
      });
    }

    for (const law of laws) {
      push({
        state,
        type: "law",
        title: law.title,
        body: `${law.category} legislation enacted in ${law.year}.`,
        contact: null,
        phone: null,
        category: law.category,
        published: true,
      });
    }
  }

  if (!rows.length) {
    return NextResponse.json({ inserted: 0, message: "Already up to date." });
  }

  // Chunked so a large first run does not hit request size limits.
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await admin.from("state_content").insert(chunk);
    if (error) {
      return NextResponse.json(
        { error: error.message, inserted },
        { status: 500 },
      );
    }
    inserted += chunk.length;
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "seed_state_content",
    entity_type: "state_content",
    meta: { inserted },
  });

  return NextResponse.json({ inserted });
}
