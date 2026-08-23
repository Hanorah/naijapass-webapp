import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

const BUCKET = "business-images";

/** Creates the public business-images bucket if missing (requires service role). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  if (!hasServiceRole()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Storage bucket is not configured. Add SUPABASE_SERVICE_ROLE_KEY or create the business-images bucket in Supabase Storage.",
      },
      { status: 503 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data: buckets, error: listError } = await admin.storage.listBuckets();
    if (listError) {
      return NextResponse.json({ ok: false, error: listError.message }, { status: 500 });
    }

    const exists = buckets?.some((bucket) => bucket.id === BUCKET || bucket.name === BUCKET);
    if (!exists) {
      const { error: createError } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      });
      if (createError && !/already exists/i.test(createError.message)) {
        return NextResponse.json({ ok: false, error: createError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, bucket: BUCKET });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not prepare storage.",
      },
      { status: 500 },
    );
  }
}
