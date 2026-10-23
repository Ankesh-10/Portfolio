"use client";

// Per-session record of visited tabs (spec §11): first visit vs return visit. The inline boot script
// writes the landing tab here before first paint; client navigations read and extend it.
const KEY = "visited";

function read(): string[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Returns whether the tab was visited before, and marks it visited. */
export function visit(slug: string): boolean {
  const v = read();
  const seen = v.includes(slug);
  if (!seen)
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...v, slug]));
    } catch {}
  return seen;
}
