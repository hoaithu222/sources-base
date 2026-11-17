/** Chuỗi rỗng / dở dang ("-", "1.") → null; còn lại là số đã parse. */
export function parseValue(raw: string): number | null {
  if (raw.trim() === '' || raw === '-' || raw === '.' || raw === '-.') return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

export function clamp(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

/** Số chữ số thập phân của `n` (không xử lý ký hiệu khoa học). */
export function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const dot = String(n).indexOf('.');
  return dot === -1 ? 0 : String(n).length - dot - 1;
}

export function roundTo(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

/** Dấu tách nghìn / thập phân của một ngôn ngữ (vd `vi` → `.` và `,`; `en` → `,` và `.`). */
export function getNumberSeparators(locale: string): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000000.5);
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  };
}
