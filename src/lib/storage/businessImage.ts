import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const BUCKET = "business-images";
const MAX_INLINE_BYTES = 120_000;

/** Resize/compress in the browser so uploads stay fast. */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not compress image."))),
      "image/jpeg",
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read compressed image."));
    reader.readAsDataURL(blob);
  });
}

async function ensureBusinessImageBucket() {
  const res = await fetch("/api/business-images/ensure", { method: "POST" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return body?.error ?? "Could not prepare image storage.";
  }
  return null;
}

async function uploadBlob(userId: string, blob: Blob) {
  const supabase = createClient();
  const path = `${userId}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "3600",
  });
  if (uploadError) return { url: null as string | null, error: uploadError.message };
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null as string | null };
}

async function inlineFallback(blob: Blob) {
  if (blob.size > MAX_INLINE_BYTES) {
    const smaller = await compressImageFile(
      new File([blob], "photo.jpg", { type: "image/jpeg" }),
      480,
      0.7,
    );
    if (smaller.size > MAX_INLINE_BYTES) {
      return {
        url: null,
        error:
          "Photo is too large without storage. Save without a photo, or ask an admin to enable the business-images bucket.",
      };
    }
    return { url: await blobToDataUrl(smaller), error: null };
  }
  return { url: await blobToDataUrl(blob), error: null };
}

export async function uploadBusinessImage(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { url: null, error: "Storage is not configured." };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const authId = user?.id ?? userId;
    if (!authId) {
      return { url: null, error: "Sign in required to upload photos." };
    }

    const blob = await compressImageFile(file);
    let result = await uploadBlob(authId, blob);

    if (result.error && /bucket not found/i.test(result.error)) {
      const ensureError = await ensureBusinessImageBucket();
      if (!ensureError) {
        result = await uploadBlob(authId, blob);
      }
    }

    if (result.url) return result;

    if (result.error && /bucket not found/i.test(result.error)) {
      const fallback = await inlineFallback(blob);
      if (fallback.url) {
        return {
          url: fallback.url,
          error: null,
        };
      }
      return fallback;
    }

    return result;
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Image upload failed.",
    };
  }
}

export function isRemoteImageUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function isStorableImageUrl(value: string) {
  if (isRemoteImageUrl(value)) return true;
  if (!value.startsWith("data:image/")) return false;
  return value.length <= MAX_INLINE_BYTES * 1.4;
}
