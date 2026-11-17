/**
 * `sitemap.xml` và `robots.txt` — `buildSitemap` · `buildRobots`, nối với nguồn thật `PUBLIC_ROUTES` / `PRIVATE_PATHS`.
 *
 * Hai điều không được hỏng:
 *   - Sitemap: mỗi route công khai ra MỘT mục cho TỪNG ngôn ngữ, mục nào cũng mang đủ hreflang để các bản dịch nối nhau.
 *   - Robots: môi trường KHÔNG cho lập chỉ mục (preview, staging) chặn toàn bộ; production chặn vùng riêng tư — CẢ bản dịch
 *     có tiền tố (`/en/dashboard`), vì `robots.txt` khớp theo tiền tố đường dẫn chứ không biết next-intl.
 */

import { describe, expect, it } from 'vitest';

import { PRIVATE_PATHS, PUBLIC_ROUTES } from '@/app/_navigation/public-routes';
import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from '@/core/i18n';
import { buildRobots } from '@/core/seo/robots.utils';
import { buildSitemap } from '@/core/seo/sitemap.utils';
import type { PublicRoute } from '@/core/seo/sitemap.utils';
import { isGuestOnlyPath, isProtectedPath } from '@/shared/constants/paths.constants';

const ORIGIN = 'https://example.com';
const OTHER_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const MODIFIED = new Date('2026-01-02T03:04:05Z');

const ROUTES: readonly PublicRoute[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1, lastModified: MODIFIED },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/legal/terms' },
];

describe('buildSitemap', () => {
  const sitemap = buildSitemap(ROUTES, ORIGIN);

  it('mỗi route × mỗi ngôn ngữ một mục, theo thứ tự route rồi ngôn ngữ', () => {
    expect(sitemap).toHaveLength(ROUTES.length * LOCALES.length);
    expect(sitemap.map((entry) => entry.url)).toEqual([
      'https://example.com/',
      'https://example.com/en',
      'https://example.com/about',
      'https://example.com/en/about',
      'https://example.com/legal/terms',
      'https://example.com/en/legal/terms',
    ]);
  });

  it('ngôn ngữ mặc định không tiền tố, ngôn ngữ khác có tiền tố; URL nào cũng tuyệt đối', () => {
    for (const entry of sitemap) expect(entry.url).toMatch(/^https:\/\/example\.com(\/|$)/);
    const about = sitemap.map((entry) => entry.url).filter((url) => url.endsWith('/about'));
    expect(about).toContain('https://example.com/about');
    for (const locale of OTHER_LOCALES) {
      expect(about).toContain(`https://example.com/${locale}/about`);
    }
  });

  it('`alternates.languages` có hreflang của MỌI ngôn ngữ, giống hệt nhau ở các mục cùng route', () => {
    const entriesOf = (suffix: string) => sitemap.filter((e) => e.url.endsWith(suffix));
    const about = entriesOf('/about');
    const expected = Object.fromEntries(
      LOCALES.map((locale) => [
        LOCALE_META[locale].hrefLang,
        locale === DEFAULT_LOCALE ? `${ORIGIN}/about` : `${ORIGIN}/${locale}/about`,
      ]),
    );

    expect(about).toHaveLength(LOCALES.length);
    for (const entry of about) expect(entry.alternates?.languages).toEqual(expected);
  });

  it('trang chủ: hreflang mặc định là `/`, bản dịch là `/<locale>`', () => {
    const home = sitemap.find((entry) => entry.url === `${ORIGIN}/`);
    const languages = home?.alternates?.languages as Record<string, string> | undefined;
    expect(languages?.[LOCALE_META[DEFAULT_LOCALE].hrefLang]).toBe(`${ORIGIN}/`);
    for (const locale of OTHER_LOCALES) {
      expect(languages?.[LOCALE_META[locale].hrefLang]).toBe(`${ORIGIN}/${locale}`);
    }
  });

  it('changeFrequency / priority / lastModified của route đi theo mọi bản dịch của nó', () => {
    const home = sitemap.filter(
      (entry) => entry.url === `${ORIGIN}/` || entry.url === `${ORIGIN}/en`,
    );
    expect(home).toHaveLength(2);
    for (const entry of home) {
      expect(entry).toMatchObject({
        changeFrequency: 'weekly',
        priority: 1,
        lastModified: MODIFIED,
      });
    }
    const bare = sitemap.find((entry) => entry.url === `${ORIGIN}/legal/terms`);
    expect(bare?.changeFrequency).toBeUndefined();
    expect(bare?.priority).toBeUndefined();
  });

  it('không route → sitemap rỗng', () => {
    expect(buildSitemap([], ORIGIN)).toEqual([]);
  });

  it('nguồn thật `PUBLIC_ROUTES` ra đúng số mục và không chứa route riêng tư', () => {
    const real = buildSitemap(PUBLIC_ROUTES, ORIGIN);
    expect(real).toHaveLength(PUBLIC_ROUTES.length * LOCALES.length);
    for (const entry of real) {
      const path =
        new URL(entry.url).pathname.replace(
          new RegExp(`^/(${OTHER_LOCALES.join('|')})(?=/|$)`),
          '',
        ) || '/';
      expect(isProtectedPath(path) || isGuestOnlyPath(path), `${entry.url} là route riêng tư`).toBe(
        false,
      );
    }
  });
});

describe('buildRobots', () => {
  const PRIVATE = ['/dashboard', '/login'];

  it('môi trường KHÔNG được lập chỉ mục → chặn toàn bộ, không khai sitemap', () => {
    expect(buildRobots({ origin: ORIGIN, allowIndexing: false, privatePaths: PRIVATE })).toEqual({
      rules: { userAgent: '*', disallow: '/' },
    });
  });

  it('production: cho phép `/`, chặn `/api/` và vùng riêng tư ở MỌI ngôn ngữ (kể cả bản dịch có tiền tố)', () => {
    const robots = buildRobots({ origin: ORIGIN, allowIndexing: true, privatePaths: PRIVATE });
    const rules = robots.rules as { userAgent: string; allow: string; disallow: string[] };

    expect(rules.userAgent).toBe('*');
    expect(rules.allow).toBe('/');
    expect(rules.disallow).toEqual(['/api/', '/dashboard', '/en/dashboard', '/login', '/en/login']);
  });

  it('khai sitemap tuyệt đối và host', () => {
    const robots = buildRobots({ origin: ORIGIN, allowIndexing: true, privatePaths: [] });
    expect(robots.sitemap).toBe(`${ORIGIN}/sitemap.xml`);
    expect(robots.host).toBe(ORIGIN);
    expect((robots.rules as { disallow: string[] }).disallow).toEqual(['/api/']);
  });

  it('nguồn thật `PRIVATE_PATHS`: mọi đường riêng tư bị chặn ở từng ngôn ngữ, không chặn nhầm route công khai', () => {
    const robots = buildRobots({
      origin: ORIGIN,
      allowIndexing: true,
      privatePaths: PRIVATE_PATHS,
    });
    const disallow = (robots.rules as { disallow: string[] }).disallow;

    for (const path of PRIVATE_PATHS) {
      expect(disallow, `thiếu ${path}`).toContain(path);
      for (const locale of OTHER_LOCALES) expect(disallow).toContain(`/${locale}${path}`);
    }
    // Dùng khớp TIỀN TỐ như trình thu thập: route công khai không được rơi vào luật chặn nào.
    for (const route of PUBLIC_ROUTES) {
      for (const locale of LOCALES) {
        const url =
          locale === DEFAULT_LOCALE
            ? route.path
            : `/${locale}${route.path === '/' ? '' : route.path}`;
        expect(
          disallow.filter((rule) => rule !== '/' && url.startsWith(rule)),
          `${url} bị robots.txt chặn`,
        ).toEqual([]);
      }
    }
  });

  it('`PRIVATE_PATHS` phủ đủ vùng cần đăng nhập, trang khách và trang 403', () => {
    expect(PRIVATE_PATHS).toEqual(expect.arrayContaining(['/dashboard', '/login', '/403']));
  });
});
