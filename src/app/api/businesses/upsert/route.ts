import { NextResponse } from "next/server";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { createClient } from "@/lib/supabase/server";

const BUSINESS_COLUMNS =
  "id, owner_id, name, category, subcategory, state, lga, address, phone, email, website, description, verified, rating, review_count, status, services, image_url, year_founded, employees";

type UpsertBody = {
  id?: string;
  name: string;
  category: string;
  subcategory: string;
  state: string;
  lga: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  services?: string[];
  image?: string;
  yearFounded?: string;
  employees?: string;
  verified?: boolean;
};

function isStorableImage(value: string | undefined) {
  if (!value) return false;
  if (/^https?:\/\//i.test(value)) return true;
  if (!value.startsWith("data:image/")) return false;
  return value.length <= 180_000;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: UpsertBody;
  try {
    body = (await request.json()) as UpsertBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.name?.trim() || !body.subcategory?.trim() || !body.state || !body.lga) {
    return NextResponse.json(
      { error: "Company name, service, state, and LGA are required." },
      { status: 400 },
    );
  }

  const payload = {
    owner_id: user.id,
    name: body.name.trim(),
    category: body.category,
    subcategory: body.subcategory.trim(),
    state: normalizeDashboardState(body.state),
    lga: body.lga,
    address: body.address?.trim() || null,
    phone: body.phone?.trim() || null,
    email: body.email?.trim() || user.email || null,
    website: body.website?.trim() || null,
    description: body.description?.trim() || null,
    services: body.services ?? [],
    image_url: isStorableImage(body.image) ? body.image : null,
    year_founded: body.yearFounded?.trim() || null,
    employees: body.employees?.trim() || null,
    status: "live",
    verified: Boolean(body.verified),
  };

  const { data: owned } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const targetId = body.id && owned?.id === body.id ? body.id : owned?.id;

  if (targetId) {
    const { data, error } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", targetId)
      .eq("owner_id", user.id)
      .select(BUSINESS_COLUMNS)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ business: data });
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert(payload)
    .select(BUSINESS_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ business: data });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ business: data });
}
