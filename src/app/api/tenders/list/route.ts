import { NextRequest, NextResponse } from "next/server";
import { TENDER_COLUMNS, type TenderRow } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

/** Public open tenders for the dashboard Live board. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const state = request.nextUrl.searchParams.get("state");

  let query = supabase
    .from("tenders")
    .select(TENDER_COLUMNS)
    .eq("status", "open")
    .order("deadline", { ascending: true, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    // Older DBs may lack publisher_type — retry without extra columns.
    if (/publisher_type|business_id|column/i.test(error.message)) {
      const fallback = await supabase
        .from("tenders")
        .select(
          "id, title, reference, mda, state, sector, value, currency, deadline, status, description, source, published_at, lga, contact_email, document_url, submitted_by, created_at",
        )
        .eq("status", "open")
        .order("deadline", { ascending: true, nullsFirst: false });
      if (fallback.error) {
        return NextResponse.json({ error: fallback.error.message, tenders: [] }, { status: 400 });
      }
      const rows = (fallback.data ?? []) as TenderRow[];
      return NextResponse.json({
        tenders: filterByState(rows, state),
        count: rows.length,
      });
    }
    return NextResponse.json({ error: error.message, tenders: [] }, { status: 400 });
  }

  const rows = (data ?? []) as TenderRow[];
  return NextResponse.json({
    tenders: filterByState(rows, state),
    count: rows.length,
  });
}

function filterByState(rows: TenderRow[], state: string | null) {
  if (!state) return rows;
  return rows.filter((row) => !row.state || row.state === state);
}
