"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — business profiles live under the directory. */
export default function MarketplaceProfileRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/directory/${id}`);
  }, [id, router]);

  return (
    <div className="px-4 py-16 text-center text-sm text-slate">
      Opening business profile…
    </div>
  );
}
