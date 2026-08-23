import { NextResponse } from "next/server";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { createClient } from "@/lib/supabase/server";

const SECTORS = [
  "Infrastructure",
  "Health",
  "Education",
  "Energy",
  "Water",
  "ICT",
  "Agriculture",
  "Security",
  "Transport",
  "Consultancy",
  "Supplies",
  "Other",
];

type Body = {
  id?: string;
  title: string;
  reference?: string;
  sector?: string;
  state: string;
  lga?: string;
  value?: string | number;
  deadline?: string;
  description?: string;
  contactEmail?: string;
  documentUrl?: string;
  status?: "open" | "closed" | "cancelled";
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["business", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Only business accounts can publish contracts." },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Give the contract a title." }, { status: 400 });
  }
  if (!body.state) {
    return NextResponse.json({ error: "Pick a state for this contract." }, { status: 400 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business && profile.role !== "admin") {
    return NextResponse.json(
      { error: "Set up your business profile before publishing a contract." },
      { status: 400 },
    );
  }

  const state = normalizeDashboardState(body.state);
  const companyName = business?.name ?? profile.full_name ?? "Business";
  const valueRaw =
    typeof body.value === "number"
      ? body.value
      : body.value
        ? Number(String(body.value).replace(/[^\d.]/g, ""))
        : null;

  const payload = {
    title: body.title.trim(),
    reference:
      body.reference?.trim() ||
      `BIZ/${state.slice(0, 3).toUpperCase()}/${Date.now().toString().slice(-6)}`,
    mda: companyName,
    state,
    sector: SECTORS.includes(body.sector ?? "") ? body.sector : "Other",
    lga: body.lga?.trim() || null,
    value: valueRaw && !Number.isNaN(valueRaw) ? valueRaw : null,
    deadline: body.deadline ? new Date(body.deadline).toISOString() : null,
    status: body.status ?? "open",
    description: body.description?.trim() || null,
    contact_email: body.contactEmail?.trim() || profile.email || user.email,
    document_url: body.documentUrl?.trim() || null,
    source: `Business · ${companyName}`,
    publisher_type: "business",
    business_id: business?.id ?? null,
    submitted_by: user.id,
    published_at: new Date().toISOString(),
  };

  if (body.id) {
    const { data, error } = await supabase
      .from("tenders")
      .update(payload)
      .eq("id", body.id)
      .eq("submitted_by", user.id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: friendlyTenderError(error.message) }, { status: 400 });
    }
    return NextResponse.json({ tender: data });
  }

  const { data, error } = await supabase
    .from("tenders")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: friendlyTenderError(error.message) }, { status: 400 });
  }

  return NextResponse.json({ tender: data });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tenders")
    .select("*")
    .eq("submitted_by", user.id)
    .eq("publisher_type", "business")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ tenders: data ?? [] });
}

function friendlyTenderError(message: string) {
  if (/duplicate key|unique/i.test(message)) {
    return "That contract reference is already in use. Leave reference blank to auto-generate.";
  }
  if (/row-level security|rls/i.test(message)) {
    return "Could not publish — run supabase/business-procurement.sql in Supabase, then try again.";
  }
  if (/publisher_type|column/i.test(message)) {
    return "Database needs an update — run supabase/business-procurement.sql in the SQL editor.";
  }
  return message;
}
