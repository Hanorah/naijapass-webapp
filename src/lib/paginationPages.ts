/** Build a condensed page list: 1 … 4 5 6 … 49 with first/last jumps. */
export function buildPaginationPages(
  page: number,
  pageCount: number,
  siblingCount = 1,
): (number | "ellipsis")[] {
  if (pageCount <= 1) return [1];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(pageCount);

  for (let i = page - siblingCount; i <= page + siblingCount; i += 1) {
    if (i >= 1 && i <= pageCount) pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && current - prev > 1) result.push("ellipsis");
    result.push(current);
  }

  return result;
}
