import type { NutrientKey } from "./types";

/**
 * Vivid sequential ramp (low → high).
 * Starts at blue so low values stay visible on yellow/orange upazila fills.
 */
const SEQUENTIAL = ["#2b83ba", "#abdda4", "#ffffbf", "#fdae61", "#d7191c"];

/** RdYlGn diverging around neutral pH. */
const PH = ["#d73027", "#fc8d59", "#ffffbf", "#91cf60", "#1a9850"];

/** Soft yellow → deep red for % deficient (still readable on gray base). */
const DEFICIENCY = ["#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026"];

/** Separate point colors — never near-white. */
const POINT_SEQUENTIAL = ["#4575b4", "#91bfdb", "#fee090", "#fc8d59", "#d73027"];
const POINT_PH = ["#d73027", "#fc8d59", "#ffffbf", "#91cf60", "#1a9850"];
const POINT_DEFICIENCY = ["#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026"];

export function colorRamp(nutrient: NutrientKey, forDeficiency = false): string[] {
  if (forDeficiency) return DEFICIENCY;
  if (nutrient === "REAC_PH") return PH;
  return SEQUENTIAL;
}

export function pointColorRamp(
  nutrient: NutrientKey,
  forDeficiency = false
): string[] {
  if (forDeficiency) return POINT_DEFICIENCY;
  if (nutrient === "REAC_PH") return POINT_PH;
  return POINT_SEQUENTIAL;
}

/** Build MapLibre interpolate using quantile breaks (resists outlier washout). */
export function maplibreInterpolate(
  property: string,
  breaks: number[],
  ramp: string[]
): unknown[] {
  const cleanBreaks = [...new Set(breaks.filter((v) => Number.isFinite(v)))].sort(
    (a, b) => a - b
  );
  if (cleanBreaks.length < 2) {
    const v0 = cleanBreaks[0] ?? 0;
    return [
      "interpolate",
      ["linear"],
      ["get", property],
      v0,
      ramp[0],
      v0 + 1,
      ramp[ramp.length - 1],
    ];
  }

  const expr: unknown[] = ["interpolate", ["linear"], ["get", property]];
  for (let i = 0; i < ramp.length; i++) {
    const t = i / (ramp.length - 1);
    const idx = t * (cleanBreaks.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const value =
      lo === hi
        ? cleanBreaks[lo]
        : cleanBreaks[lo] + (cleanBreaks[hi] - cleanBreaks[lo]) * (idx - lo);
    expr.push(value, ramp[i]);
  }
  return expr;
}

/** Percentile breaks; use p5–p95 so extreme outliers don't flatten colors. */
export function niceBreaks(values: number[], count = 5): number[] {
  const clean = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!clean.length) return [0, 1];
  if (clean.length === 1) return [clean[0], clean[0] + 1];

  const pct = (p: number) => {
    const i = Math.min(clean.length - 1, Math.max(0, Math.floor(p * (clean.length - 1))));
    return clean[i];
  };

  // Robust window
  const low = pct(0.05);
  const high = pct(0.95);
  if (low === high) {
    return [clean[0], clean[clean.length - 1] || clean[0] + 1];
  }

  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    out.push(low + (high - low) * t);
  }
  return out;
}

export function formatValue(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(digits);
}

export function formatPct(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(0)}%`;
}
