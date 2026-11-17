/**
 * URL đa ngôn ngữ cho SEO — `localizedPath` · `absoluteUrl` · `buildAlternates`.
 *
 * Quy tắc tiền tố (`as-needed`: ngôn ngữ mặc định KHÔNG tiền tố) được viết HAI lần: ở `routing.localePrefix` cho next-intl
 * (`Link`, `proxy.ts`) và ở `localizedPath` cho canonical / hreflang / sitemap / OG. Lệch nhau là canonical trỏ vào URL mà
 * `proxy.ts` chuyển hướng đi chỗ khác — nên bài kiểm so thẳng với `getPathname` của next-intl.
 */

import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALE_META, LOCALES, getPathname, routing } from '@/core/i18n';
import type { Locale } from '@/core/i18n';
import { absoluteUrl, buildAlternates, localizedPath } from '@/core/seo/url.utils';

const ORIGIN = 'https://example.com';
const OTHER_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
/** Đường mẫu: gốc, một cấp, nhiều cấp, có dấu `-`, route con. */
const PATHS = ['/', '/about', '/login', '/forgot-password', '/dashboard/reports/monthly', '/403'];

describe('localizedPath', () => {
  it('ngôn ngữ mặc định KHÔNG tiền tố — giữ nguyên URL cũ khi thêm đa ngôn ngữ', () => {
    expect(localizedPath('/login', DEFAULT_LOCALE)).toBe('/login');
    expect(localizedPath('/', DEFAULT_LOCALE)).toBe('/');
  });

  it.each(OTHER_LOCALES)(
    'ngôn ngữ `%s` có tiền tố; trang chủ là `/<locale>` (không dấu `/` cuối)',
    (locale) => {
      expect(localizedPath('/login', locale)).toBe(`/${locale}/login`);
      expect(localizedPath('/dashboard/reports', locale)).toBe(`/${locale}/dashboard/reports`);
      expect(localizedPath('/', locale)).toBe(`/${locale}`);
    },
  );

  it.each(LOCALES.flatMap((locale) => PATHS.map((path) => [locale, path] as const)))(
    'khớp `getPathname` của next-intl: [%s] %s',
    (locale, path) => {
      expect(localizedPath(path, locale)).toBe(getPathname({ href: path, locale }));
    },
  );

  it('cấu hình định tuyến vẫn là `as-needed` với đúng ngôn ngữ mặc định — hai nguồn không được lệch', () => {
    expect(routing.localePrefix).toBe('as-needed');
    expect(routing.defaultLocale).toBe(DEFAULT_LOCALE);
    expect([...routing.locales]).toEqual([...LOCALES]);
  });
});

describe('absoluteUrl', () => {
  it('ghép gốc site với đường dẫn', () => {
    expect(absoluteUrl(ORIGIN, '/en/about')).toBe('https://example.com/en/about');
    expect(absoluteUrl(ORIGIN, '/')).toBe('https://example.com/');
  });
});

describe('buildAlternates', () => {
  it.each(LOCALES)('canonical của chính trang theo ngôn ngữ `%s`', (locale) => {
    const { canonical } = buildAlternates('/about', locale, ORIGIN);
    expect(canonical).toBe(absoluteUrl(ORIGIN, localizedPath('/about', locale)));
  });

  it('hreflang đủ MỌI ngôn ngữ (kể cả chính nó) + `x-default`, đều là URL tuyệt đối', () => {
    const { languages } = buildAlternates('/about', 'en', ORIGIN);
    expect(Object.keys(languages).sort()).toEqual(
      [...LOCALES.map((locale) => LOCALE_META[locale].hrefLang), 'x-default'].sort(),
    );
    for (const url of Object.values(languages)) expect(url).toMatch(/^https:\/\/example\.com\//);
  });

  it('`x-default` trỏ ngôn ngữ MẶC ĐỊNH (không tiền tố), bất kể trang đang ở ngôn ngữ nào', () => {
    for (const locale of LOCALES) {
      expect(buildAlternates('/about', locale, ORIGIN).languages['x-default']).toBe(
        'https://example.com/about',
      );
    }
  });

  it('bộ hreflang giống nhau ở MỌI ngôn ngữ của một trang — công cụ tìm kiếm cần các bản dịch trỏ chéo đối xứng', () => {
    const [first, ...rest] = LOCALES.map((locale) => buildAlternates('/about', locale, ORIGIN));
    for (const other of rest) expect(other.languages).toEqual(first.languages);
  });

  it('trang chủ: bản mặc định là `/`, bản dịch là `/<locale>`', () => {
    const { languages, canonical } = buildAlternates('/', 'en', ORIGIN);
    expect(canonical).toBe('https://example.com/en');
    expect(languages[LOCALE_META[DEFAULT_LOCALE].hrefLang]).toBe('https://example.com/');
    expect(languages[LOCALE_META.en.hrefLang]).toBe('https://example.com/en');
  });

  it.each(LOCALES.flatMap((locale) => PATHS.map((path) => [locale, path] as const)))(
    'mọi URL trong hreflang khớp `getPathname`: [%s] %s',
    (locale: Locale, path: string) => {
      const { languages, canonical } = buildAlternates(path, locale, ORIGIN);
      expect(canonical).toBe(`${ORIGIN}${getPathname({ href: path, locale })}`);
      for (const item of LOCALES) {
        expect(languages[LOCALE_META[item].hrefLang]).toBe(
          `${ORIGIN}${getPathname({ href: path, locale: item })}`,
        );
      }
    },
  );
});
