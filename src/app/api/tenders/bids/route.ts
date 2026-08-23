import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

const BID_COLUMNS =
  "id, tender_id, bidder_id, business_id, business_name, contact_email, proposed_amount, currency, notes, status, created_at, updated_at";

type BidBody = {
  tenderId: string;
  proposedAmount: string;
  notes?: string;
  status?: "draft" | "submitted" | "withdrawn";
};

type PatchBody = {
  bidId: string;
  status: "accepted" | "rejected" | "withdrawn";
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const view = new URL(request.url).searchParams.get("view");

  if (view === "incoming") {
    const { data: myTenders, error: tenderError } = await supabase
      .from("tenders")
      .select("id")
      .eq("submitted_by", user.id);

    if (tenderError) {
      if (/relation|does not exist|schema cache/i.test(tenderError.message)) {
        return NextResponse.json({ bids: [], needsMigration: true });
      }
      return NextResponse.json({ error: tenderError.message }, { status: 400 });
    }

    const tenderIds = (myTenders ?? []).map((t) => t.id);
    if (!tenderIds.length) {
      return NextResponse.json({ bids: [] });
    }

    const { data, error } = await supabase
      .from("tender_bids")
      .select(
        `${BID_COLUMNS}, tenders ( title, reference, deadline, status, mda, state )`,
      )
      .in("tender_id", tenderIds)
      .order("updated_at", { ascending: false });

    if (error) {
      if (/relation|does not exist|schema cache/i.test(error.message)) {
        return NextResponse.json({ bids: [], needsMigration: true });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ bids: data ?? [] });
  }

  const { data, error } = await supabase
    .from("tender_bids")
    .select(`${BID_COLUMNS}, tenders ( title, reference, deadline, status, mda, state )`)
    .eq("bidder_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      return NextResponse.json({ bids: [], needsMigration: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ bids: data ?? [] });
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["business", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Only business accounts can submit bids." },
      { status: 403 },
    );
  }

  let body: BidBody;
  try {
    body = (await request.json()) as BidBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.tenderId) {
    return NextResponse.json({ error: "Missing tender." }, { status: 400 });
  }
  if (!body.proposedAmount?.trim()) {
    return NextResponse.json({ error: "Enter your proposed bid amount." }, { status: 400 });
  }

  const { data: tender, error: tenderError } = await supabase
    .from("tenders")
    .select("id, title, reference, status, submitted_by, contact_email, mda")
    .eq("id", body.tenderId)
    .maybeSingle();

  if (tenderError || !tender) {
    return NextResponse.json(
      {
        error:
          "This catalogue tender is not in the live database yet. Import the research catalogue or bid on a published contract.",
        code: "SEED_TENDER",
      },
      { status: 400 },
    );
  }

  if (tender.status !== "open") {
    return NextResponse.json({ error: "This tender is no longer open for bids." }, { status: 400 });
  }

  if (tender.submitted_by === user.id) {
    return NextResponse.json(
      { error: "You cannot bid on a contract you published." },
      { status: 400 },
    );
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business && profile.role !== "admin") {
    return NextResponse.json(
      { error: "Set up your business profile before bidding." },
      { status: 400 },
    );
  }

  const amount = Number(String(body.proposedAmount).replace(/[^\d.]/g, ""));
  const payload = {
    tender_id: tender.id,
    bidder_id: user.id,
    business_id: business?.id ?? null,
    business_name: business?.name ?? profile.full_name ?? "Business",
    contact_email: profile.email ?? user.email ?? "",
    proposed_amount: Number.isFinite(amount) ? amount : null,
    notes: body.notes?.trim() || null,
    status: body.status ?? "submitted",
  };

  const { data: existing } = await supabase
    .from("tender_bids")
    .select("id")
    .eq("tender_id", tender.id)
    .eq("bidder_id", user.id)
    .maybeSingle();

  const query = existing
    ? supabase.from("tender_bids").update(payload).eq("id", existing.id)
    : supabase.from("tender_bids").insert(payload);

  const { data, error } = await query.select(BID_COLUMNS).single();

  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "Run supabase/business-procurement.sql in Supabase to enable live bidding.",
          code: "NEEDS_MIGRATION",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let notified = false;
  if ((body.status ?? "submitted") === "submitted" && !existing) {
    let publisherEmail = tender.contact_email?.trim() || null;
    if (!publisherEmail && tender.submitted_by) {
      const { data: publisher } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", tender.submitted_by)
        .maybeSingle();
      publisherEmail = publisher?.email ?? null;
    }

    if (publisherEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const amountLabel = payload.proposed_amount
        ? `₦${payload.proposed_amount.toLocaleString("en-NG")}`
        : body.proposedAmount;
      const mail = await sendTransactionalEmail({
        to: publisherEmail,
        subject: `New bid on ${tender.reference ?? tender.title}`,
        text: [
          `You received a new bid on NaijaPass.`,
          ``,
          `Contract: ${tender.title}`,
          `Reference: ${tender.reference ?? tender.id}`,
          `Bidder: ${payload.business_name}`,
          `Amount: ${amountLabel}`,
          payload.notes ? `Notes: ${payload.notes}` : null,
          ``,
          `Review bids: ${appUrl}/dashboard/profile`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      notified = mail.sent;
    }
  }

  return NextResponse.json({
    bid: {
      id: data.id,
      tenderRef: tender.reference ?? tender.id.slice(0, 8).toUpperCase(),
      tenderTitle: tender.title,
      tenderId: tender.id,
      businessName: data.business_name,
      contactEmail: data.contact_email,
      proposedAmount: String(data.proposed_amount ?? body.proposedAmount),
      notes: data.notes ?? "",
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    notified,
  });
}

/** Publisher accepts or rejects a bid on their contract. */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.bidId || !["accepted", "rejected", "withdrawn"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid bid decision." }, { status: 400 });
  }

  const { data: bid, error: bidError } = await supabase
    .from("tender_bids")
    .select("id, tender_id, bidder_id, business_name, contact_email, status")
    .eq("id", body.bidId)
    .maybeSingle();

  if (bidError || !bid) {
    return NextResponse.json({ error: "Bid not found." }, { status: 404 });
  }

  const { data: tender } = await supabase
    .from("tenders")
    .select("id, title, reference, submitted_by")
    .eq("id", bid.tender_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isPublisher = tender?.submitted_by === user.id;
  const isBidder = bid.bidder_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (body.status === "withdrawn") {
    if (!isBidder && !isAdmin) {
      return NextResponse.json({ error: "Only the bidder can withdraw." }, { status: 403 });
    }
  } else if (!isPublisher && !isAdmin) {
    return NextResponse.json(
      { error: "Only the contract publisher can accept or reject bids." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("tender_bids")
    .update({ status: body.status })
    .eq("id", bid.id)
    .select(BID_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if ((body.status === "accepted" || body.status === "rejected") && bid.contact_email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendTransactionalEmail({
      to: bid.contact_email,
      subject: `Your bid was ${body.status}: ${tender?.reference ?? tender?.title ?? "contract"}`,
      text: [
        `Hi ${bid.business_name},`,
        ``,
        `Your bid on “${tender?.title ?? "a contract"}” (${tender?.reference ?? ""}) was ${body.status}.`,
        ``,
        `View your bids: ${appUrl}/dashboard/profile`,
      ].join("\n"),
    });
  }

  return NextResponse.json({ bid: data });
}
