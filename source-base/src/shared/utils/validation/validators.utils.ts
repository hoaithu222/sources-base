import { z } from 'zod';

/**
 * validators — helper Zod chuẩn hoá validation cho toàn hệ thống (docs/rules/data/form-validation.md).
 *
 * Dùng:   z.object({ name: requiredText('Tên là bắt buộc').max(200), email: emailField(), phone: phoneField() })
 * Lưu ý:  ⛔ text bắt buộc TỰ ĐỘNG `.trim().min(1, msg)`; password / token KHÔNG trim (space là ký tự hợp lệ).
 */

/** Text bắt buộc — tự `.trim().min(1, msg)`; chuỗi toàn khoảng trắng → lỗi. */
export function requiredText(msg = 'Bắt buộc') {
  return z.string().trim().min(1, msg);
}

/** Text không bắt buộc — tự trim, mặc định `''` (chỉ khoảng trắng → `''`). */
export function optionalText() {
  return z.string().trim().optional().default('');
}

const STRICT_EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]+(?<!\.)@(?!\.)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * Email chặt hơn Zod `.email()`: không `..`, không `.` đầu/cuối local part hoặc ngay sau `@`,
 * TLD ≥ 2 ký tự; tối đa 254 ký tự.
 */
export function emailField(msg = 'Email không đúng định dạng') {
  return z
    .string()
    .trim()
    .min(1, msg)
    .max(254, 'Email tối đa 254 ký tự')
    .regex(STRICT_EMAIL_RE, msg);
}

/** Email không bắt buộc (rỗng OK, có giá trị phải đúng định dạng); mặc định `''`. */
export function optionalEmailField(msg = 'Email không đúng định dạng') {
  return z
    .string()
    .trim()
    .max(254, 'Email tối đa 254 ký tự')
    .refine((v) => v === '' || STRICT_EMAIL_RE.test(v), { message: msg })
    .optional()
    .default('');
}

const VN_MOBILE_RE = /^(0[35789])\d{8}$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

/** SĐT di động VN (10 số, đầu 03/05/07/08/09) hoặc quốc tế E.164 (`+` + 8–15 số); tối đa 16 ký tự. */
export function phoneField(msg = 'Số điện thoại không hợp lệ') {
  return z
    .string()
    .trim()
    .min(1, msg)
    .max(16, 'SĐT tối đa 16 ký tự')
    .refine((v) => VN_MOBILE_RE.test(v) || E164_RE.test(v), { message: msg });
}

/** Như `phoneField` nhưng rỗng OK; mặc định `''`. */
export function optionalPhoneField(msg = 'Số điện thoại không hợp lệ') {
  return z
    .string()
    .trim()
    .max(16, 'SĐT tối đa 16 ký tự')
    .refine((v) => v === '' || VN_MOBILE_RE.test(v) || E164_RE.test(v), { message: msg })
    .optional()
    .default('');
}

const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

/** IPv4 chuẩn (0.0.0.0 – 255.255.255.255). */
export function ipv4Field(msg = 'IP không hợp lệ') {
  return z.string().trim().min(1, msg).regex(IPV4_RE, msg);
}

/** IPv4 + port `192.168.1.1:8080` — port 1-65535. */
export function ipv4WithPortField(msg = 'IP:Port không hợp lệ') {
  return z
    .string()
    .trim()
    .min(1, msg)
    .refine(
      (v) => {
        const [ip, port] = v.split(':');
        if (!ip || !port) return false;
        if (!IPV4_RE.test(ip)) return false;
        const p = Number(port);
        return Number.isInteger(p) && p >= 1 && p <= 65535;
      },
      { message: msg },
    );
}

/** URL có protocol bắt buộc (http/https), chấp nhận query / hash / path; tối đa 2048 ký tự. */
export function urlField(msg = 'URL không hợp lệ') {
  return z
    .string()
    .trim()
    .min(1, msg)
    .max(2048, 'URL tối đa 2048 ký tự')
    .refine(
      (v) => {
        try {
          const u = new URL(v);
          return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: msg },
    );
}

/** Password 6-64 ký tự (đổi qua `min` / `max`), KHÔNG trim. Cần mật khẩu mạnh → `strongPasswordField`. */
export function passwordField(min = 6, max = 64) {
  return z
    .string()
    .min(min, `Mật khẩu tối thiểu ${min} ký tự`)
    .max(max, `Mật khẩu tối đa ${max} ký tự`);
}

/** Mật khẩu mạnh: ≥ 8 ký tự, có chữ hoa + chữ thường + số; `requireSpecial: true` bắt thêm ký tự đặc biệt. */
export function strongPasswordField(opts: { requireSpecial?: boolean } = {}) {
  const { requireSpecial = false } = opts;
  let s = z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .max(64, 'Mật khẩu tối đa 64 ký tự')
    .regex(/[a-z]/, 'Phải có chữ thường')
    .regex(/[A-Z]/, 'Phải có chữ hoa')
    .regex(/\d/, 'Phải có số');
  if (requireSpecial) {
    s = s.regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, 'Phải có ký tự đặc biệt');
  }
  return s;
}

/** Phần trăm 0-100 (nhận cả chuỗi số, `z.coerce`). */
export function percentField(msg = 'Giá trị phải từ 0 đến 100') {
  return z.coerce.number().min(0, msg).max(100, msg);
}

/** Số nguyên ≥ 0 (gồm cả 0; nhận cả chuỗi số). */
export function positiveIntField(msg = 'Phải là số nguyên không âm') {
  return z.coerce.number().int(msg).min(0, msg);
}

/**
 * Đối số cho `.refine()` đảm bảo ngày bắt đầu ≤ ngày kết thúc (lỗi gắn vào `endKey`; thiếu một đầu → bỏ qua):
 * `z.object({ startDate, endDate }).refine(...ensureRangeOrder('startDate', 'endDate'))`.
 */
export function ensureRangeOrder<S extends string, E extends string>(
  startKey: S,
  endKey: E,
  msg = 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
) {
  return [
    (v: Record<string, unknown>) => {
      const s = v[startKey];
      const e = v[endKey];
      if (!s || !e || typeof s !== 'string' || typeof e !== 'string') return true;
      return new Date(s).getTime() <= new Date(e).getTime();
    },
    { message: msg, path: [endKey] as [E] },
  ] as const;
}

/**
 * Set mã đã dùng (trim + UPPERCASE, bỏ qua bản ghi đang sửa `editingId`) để kiểm trùng không phân biệt hoa/thường:
 * `codes.has(values.code.trim().toUpperCase())` → báo lỗi trùng. `getId` mặc định đọc `item.id`.
 */
export function buildCodeSet<T>(
  items: readonly T[],
  editingId: string | number | undefined,
  getCode: (item: T) => string,
  getId: (item: T) => string | number = (i) => (i as { id: string | number }).id,
): Set<string> {
  const set = new Set<string>();
  for (const item of items) {
    if (editingId != null && getId(item) === editingId) continue;
    const c = getCode(item);
    if (typeof c === 'string' && c.trim() !== '') {
      set.add(c.trim().toUpperCase());
    }
  }
  return set;
}
