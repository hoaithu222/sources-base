import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

/**
 * parse-date.utils — đọc chuỗi ngày người dùng GÕ TAY cho các date picker (hàm thuần).
 *
 * Dùng:   tryParseDate('20/01/2024', formats) · tryParseDateRange('20/06/2026 - 30/06/2026', formats)
 */

dayjs.extend(customParseFormat);

export const COMMON_DATE_FORMATS = [
  'DD/MM/YYYY',
  'D/M/YYYY',
  'DD/MM/YY',
  'D/M/YY',
  'DD-MM-YYYY',
  'D-M-YYYY',
  'YYYY-MM-DD',
  'YYYY/MM/DD',
];

const RANGE_SEPARATOR_RE = /\s*[-–—~→]\s*/;

interface ParsedDateRange {
  from: Dayjs | null;
  to: Dayjs | null;
}

export function tryParseDate(raw: string, formats: string[] = COMMON_DATE_FORMATS): Dayjs | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  for (const fmt of formats) {
    const d = dayjs(trimmed, fmt, true);
    if (d.isValid()) return d;
  }
  return null;
}

/** Đọc "20/06/2026 - 30/06/2026" hoặc một ngày đơn; hai đầu mà `to` < `from` thì hoán đổi. */
export function tryParseDateRange(
  raw: string,
  formats: string[] = COMMON_DATE_FORMATS,
): ParsedDateRange | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(RANGE_SEPARATOR_RE).filter(Boolean);
  if (parts.length === 1) {
    const from = tryParseDate(parts[0], formats);
    return from ? { from, to: null } : null;
  }
  if (parts.length === 2) {
    const from = tryParseDate(parts[0], formats);
    const to = tryParseDate(parts[1], formats);
    if (!from && !to) return null;
    if (from && to && to.isBefore(from, 'day')) return { from: to, to: from };
    return { from, to };
  }
  return null;
}
