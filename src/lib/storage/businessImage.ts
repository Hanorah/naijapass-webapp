import { apiFetch, getToken, isApiConfigured } from "@/lib/api/client";

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

/** No remote bucket any more: images are stored inline as data URLs. */
export async function ensureBusinessImagesBucket(): Promise<{ ok: true; error: null }> {
  return { ok: true, error: null };
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
          "Photo is too large. Try a smaller image, or save without a photo.",
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
  void userId;
  try {
    const blob = await compressImageFile(file);

    if (isApiConfigured() && getToken()) {
      try {
        const form = new FormData();
        form.append("file", blob, "photo.jpg");
        const body = await apiFetch<{ url?: string }>("/api/uploads", {
          method: "POST",
          body: form,
        });
        if (body.url) return { url: body.url, error: null };
      } catch {
        /* fall back to an inline data URL below */
      }
    }

    return await inlineFallback(blob);
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
