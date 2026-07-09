// Shared pagination constants + pure helpers for the content index pages.

export const PRACTICES_PAGE_SIZE = 6;
export const ARTICLES_PAGE_SIZE = 4;

export function computeTotalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

/** 1-based page slice, clamped to a valid page. */
export function pageSlice<T>(items: T[], page: number, pageSize: number): T[] {
  const p = Math.min(computeTotalPages(items.length, pageSize), Math.max(1, page));
  return items.slice((p - 1) * pageSize, p * pageSize);
}

/** Float featured item(s) to the front. List is already publishedDate_DESC; sort is stable. */
export function featuredFirst<T extends { featured?: boolean | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}
