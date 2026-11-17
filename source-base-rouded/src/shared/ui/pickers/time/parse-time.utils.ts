/**
 * parse-time.utils — phân tích chuỗi giờ người dùng GÕ TAY cho `TimePicker` (hàm thuần).
 *
 * Dùng:   parseTimeInput('1530') → { ok: true, value: '15:30', hour: 15, minute: 30 }
 * Lưu ý:  Chỉ nhận số hoặc số + `:`; số thuần đọc theo độ dài (9 → 09:00 · 930 → 09:30 · 1530 → 15:30).
 *         Bảng luật đầy đủ: docs/notes/components/pickers.md (## parse-time.utils).
 */

export type TimeParseErrorCode =
  | 'INVALID_CHARS'
  | 'MULTIPLE_COLONS'
  | 'MISSING_HOUR'
  | 'HOUR_TOO_LONG'
  | 'MINUTE_TOO_LONG'
  | 'TOO_MANY_DIGITS'
  | 'HOUR_OUT_OF_RANGE'
  | 'MINUTE_OUT_OF_RANGE';

type TimeParseResult =
  | { ok: true; value: null }
  | { ok: true; value: string; hour: number; minute: number }
  | { ok: false; code: TimeParseErrorCode; message: string };

export const TIME_PARSE_MESSAGES: Record<TimeParseErrorCode, string> = {
  INVALID_CHARS: 'Chỉ nhập số và dấu hai chấm. Ví dụ: 1530 hoặc 15:30',
  MULTIPLE_COLONS: 'Chỉ được dùng một dấu hai chấm',
  MISSING_HOUR: 'Thiếu số giờ trước dấu hai chấm',
  HOUR_TOO_LONG: 'Giờ tối đa 2 chữ số',
  MINUTE_TOO_LONG: 'Phút tối đa 2 chữ số',
  TOO_MANY_DIGITS: 'Nhập tối đa 4 chữ số. Ví dụ: 1530 = 15:30',
  HOUR_OUT_OF_RANGE: 'Giờ phải từ 00 đến 23',
  MINUTE_OUT_OF_RANGE: 'Phút phải từ 00 đến 59',
};

const ALLOWED_RE = /^[0-9:]+$/;

const fail = (code: TimeParseErrorCode): TimeParseResult => ({
  ok: false,
  code,
  message: TIME_PARSE_MESSAGES[code],
});

const pad2 = (n: number) => String(n).padStart(2, '0');

const foldFullwidth = (raw: string) =>
  raw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/：/g, ':');

export const formatTimeValue = (hour: number, minute: number) => `${pad2(hour)}:${pad2(minute)}`;

/** Chuỗi gõ tay → giờ:phút. Chuỗi rỗng → `{ ok: true, value: null }` (yêu cầu xoá giá trị). */
export function parseTimeInput(raw: string): TimeParseResult {
  const text = foldFullwidth(raw).trim();
  if (!text) return { ok: true, value: null };
  if (!ALLOWED_RE.test(text)) return fail('INVALID_CHARS');

  let hour: number;
  let minute: number;
  const colonCount = (text.match(/:/g) ?? []).length;

  if (colonCount > 1) return fail('MULTIPLE_COLONS');

  if (colonCount === 1) {
    const [hh, mm] = text.split(':');
    if (!hh) return fail('MISSING_HOUR');
    if (hh.length > 2) return fail('HOUR_TOO_LONG');
    if (mm.length > 2) return fail('MINUTE_TOO_LONG');
    hour = Number(hh);
    minute = mm ? Number(mm) : 0;
  } else {
    if (text.length > 4) return fail('TOO_MANY_DIGITS');
    if (text.length <= 2) {
      hour = Number(text);
      minute = 0;
    } else {
      const cut = text.length - 2;
      hour = Number(text.slice(0, cut));
      minute = Number(text.slice(cut));
    }
  }

  if (hour > 23) return fail('HOUR_OUT_OF_RANGE');
  if (minute > 59) return fail('MINUTE_OUT_OF_RANGE');

  return { ok: true, value: formatTimeValue(hour, minute), hour, minute };
}

/** `true` → nên báo lỗi NGAY khi còn đang gõ; chuỗi toàn số ngắn hơn 4 chữ số là "chưa gõ xong". */
export function shouldReportWhileTyping(raw: string): boolean {
  const text = foldFullwidth(raw).trim();
  return !(/^[0-9]+$/.test(text) && text.length < 4);
}

/** `true` khi đã gõ ĐỦ 4 chữ số — mốc để tự chèn dấu hai chấm ngay lúc gõ. */
export function isCompleteDigitEntry(raw: string): boolean {
  return /^[0-9]{4}$/.test(foldFullwidth(raw).trim());
}

export function splitTimeValue(value: string | null | undefined): {
  hour: number | null;
  minute: number | null;
} {
  const res = parseTimeInput(value ?? '');
  if (!res.ok || res.value === null) return { hour: null, minute: null };
  return { hour: res.hour, minute: res.minute };
}
