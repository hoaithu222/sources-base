/**
 * Danh sách ngôn ngữ + siêu dữ liệu từng ngôn ngữ — NGUỒN DUY NHẤT.
 *
 * Thêm ngôn ngữ: thêm vào `LOCALES` + `LOCALE_META`, tạo `src/messages/<mã>/`, đăng ký ở
 * `src/core/i18n/messages.ts` (TypeScript báo đỏ chỗ nào còn thiếu). Hướng dẫn: `docs/guides/i18n.md`.
 */

export const LOCALES = ['vi', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Ngôn ngữ mặc định — phục vụ ở URL KHÔNG tiền tố (`/login`); ngôn ngữ khác có tiền tố (`/en/login`). */
export const DEFAULT_LOCALE: Locale = 'vi';

interface LocaleMeta {
  /** Tên ngôn ngữ viết bằng CHÍNH ngôn ngữ đó — hiện ở bộ chọn ngôn ngữ. */
  label: string;
  /** Nhãn ngắn cho chỗ hẹp (header điện thoại). */
  shortLabel: string;
  /** Giá trị cho `<html lang>`. */
  htmlLang: string;
  /** Giá trị `hreflang` ở thẻ alternate (sitemap, `<link rel="alternate">`). */
  hrefLang: string;
  /** Mã `og:locale` — dạng `ngôn_ngữ_QUỐC_GIA`. */
  ogLocale: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  vi: { label: 'Tiếng Việt', shortLabel: 'VI', htmlLang: 'vi', hrefLang: 'vi', ogLocale: 'vi_VN' },
  en: { label: 'English', shortLabel: 'EN', htmlLang: 'en', hrefLang: 'en', ogLocale: 'en_US' },
};

/** Tên cookie ghi nhớ ngôn ngữ người dùng đã chọn (next-intl đọc / ghi). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
