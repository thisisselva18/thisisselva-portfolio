// Where each scene sits on the year bar (design.md section 8): its date, read from its own
// words, so nothing new is written. A scene's first corner tag ("September 2024", "2024") or,
// failing that, a year its first line opens with ("2017. A kid with a camera."). A scene with
// no date of its own (Anthpo) sits halfway between its neighbours.

import type { Scene } from "@/content/types";

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "September 2024" → 2024.67, "2024" → 2024, anything else → null. */
export function parseDate(text: string): number | null {
  const m = text.trim().match(/^(?:([A-Za-z]+)\s+)?(\d{4})\b/);
  if (!m) return null;
  const month = m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : 0;
  if (month < 0) return null;
  return Number(m[2]) + month / 12;
}

function ownDate(scene: Scene): number | null {
  const tag = scene.supertitles.find((l) => l.cornerTag)?.cornerTag;
  return (tag ? parseDate(tag) : null) ?? parseDate(scene.supertitles[0]?.text ?? "");
}

/** Each scene's date, in order; undated scenes take the midpoint of the dated ones around them. */
export function sceneDates(scenes: Scene[]): number[] {
  const own = scenes.map(ownDate);
  return own.map((date, i) => {
    if (date !== null) return date;
    const before = own.slice(0, i).reverse().find((d) => d !== null) ?? null;
    const after = own.slice(i + 1).find((d) => d !== null) ?? null;
    return before !== null && after !== null ? (before + after) / 2 : (before ?? after ?? 0);
  });
}
