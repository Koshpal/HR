import type { Guarded, Suppressed } from '../types/dashboard.types';

export const isSuppressed = (v: unknown): v is Suppressed =>
  !!v && typeof v === 'object' && (v as { suppressed?: unknown }).suppressed === true;

/** `fmt(value)` for a real number, or a plain "Hidden" for a figure the server held back to protect privacy. */
export function showGuarded(v: Guarded | undefined | null, fmt: (n: number) => string = String, hidden = 'Hidden'): string {
  if (v === undefined || v === null) return '—';
  return isSuppressed(v) ? hidden : fmt(v);
}

/** A number for charts: hidden figures draw as zero (their label says why). */
export const asChartNumber = (v: Guarded | undefined | null): number => (typeof v === 'number' ? v : 0);

export const hiddenNote = (min?: number) => `Hidden: fewer than ${min ?? 5} people are behind this figure.`;
