import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from '@/core/i18n';
import type { Locale } from '@/core/i18n';

/**
 * URL đa ngôn ngữ cho SEO — hàm THUẦN, không đọc cấu hình, dùng được ở mọi nơi.
 *
 *   localizedPath('/login', 'en')           → '/en/login'
 *   localizedPath('/login', 'vi')           → '/login'           (ngôn ngữ mặc định không tiền tố)
 *   absoluteUrl('https://a.com', '/en')     → 'https://a.com/en'
 *   buildAlternates('/about', 'en', origin) → { canonical, languages: { vi, en, 'x-default' } }
 *
 * Lưu ý: quy tắc tiền tố PHẢI khớp `routing.localePrefix` (`as-needed`) — `tests/core/seo-url.test.ts` so với
 * `getPathname` của next-intl nên đổi một bên mà quên bên kia là test đỏ.
 */

export function localizedPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(origin: string, path: string): string {
  return `${origin}${path}`;
}

interface Alternates {
  canonical: string;
  /** `hreflang` → URL tuyệt đối; luôn có `x-default` trỏ ngôn ngữ mặc định. */
  languages: Record<string, string>;
}

/**
 * Canonical của chính trang + hreflang của MỌI ngôn ngữ (kể cả chính nó, theo khuyến nghị của Google).
 * `x-default` = ngôn ngữ mặc định: nơi gửi người dùng có ngôn ngữ không nằm trong danh sách.
 */
export function buildAlternates(path: string, locale: Locale, origin: string): Alternates {
  const languages: Record<string, string> = {};
  LOCALES.forEach((item) => {
    languages[LOCALE_META[item].hrefLang] = absoluteUrl(origin, localizedPath(path, item));
  });
  languages['x-default'] = absoluteUrl(origin, localizedPath(path, DEFAULT_LOCALE));

  return { canonical: absoluteUrl(origin, localizedPath(path, locale)), languages };
}
