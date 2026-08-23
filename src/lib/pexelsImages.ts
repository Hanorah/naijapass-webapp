/** Local Pexels assets in /public — used across directory, marketplace, and audience cards. */
export const PEXELS_IMAGES = [
  "/pexels-harrun-muhammad-116282236-33806113.jpg",
  "/pexels-meshack-emmanuel-kazanshyi-1267432081-29832529.jpg",
  "/pexels-daggash-farhan-1851897902-30220079.jpg",
  "/pexels-shotbywrz-734724649-18431669.jpg",
  "/pexels-shotbywrz-734724649-18431682.jpg",
] as const;

export function pexelsImage(index: number): string {
  return PEXELS_IMAGES[Math.abs(index) % PEXELS_IMAGES.length];
}

/** Stable pick from a string id (business slug, listing id, etc.). */
export function pexelsImageForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PEXELS_IMAGES[hash % PEXELS_IMAGES.length];
}

export const PEXELS_BUSINESS = PEXELS_IMAGES[3];
export const PEXELS_GOVT = PEXELS_IMAGES[0];
export const PEXELS_DEFAULT = PEXELS_IMAGES[1];
