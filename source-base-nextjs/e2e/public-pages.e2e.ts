import { SITE_ORIGIN } from './support/env';
import { expectHydrated } from './support/flows';
import { en, vi } from './support/messages';
import { expect, test } from './support/test';

/**
 * Trang công khai trên bản production: ngôn ngữ, SEO, chuyển ngôn ngữ, `robots.txt` / `sitemap.xml`, header bảo mật.
 * Jsdom không dựng được `generateMetadata`, route SEO và header của `next.config.ts` — chỉ bản build thật mới chứng minh.
 */

/** Gốc của ngôn ngữ mặc định viết KHÔNG có `/` cuối: Next chuẩn hoá URL gốc site khi dựng thẻ `<link>`. */
const HOME_PAGES = [
  {
    name: '/ (vi, không tiền tố)',
    path: '/',
    lang: 'vi',
    h1: vi('landing.hero.title'),
    title: vi('metadata.home.title'),
    canonical: SITE_ORIGIN,
    ogImage: `${SITE_ORIGIN}/opengraph-image`,
  },
  {
    name: '/en',
    path: '/en',
    lang: 'en',
    h1: en('landing.hero.title'),
    title: en('metadata.home.title'),
    canonical: `${SITE_ORIGIN}/en`,
    ogImage: `${SITE_ORIGIN}/en/opengraph-image`,
  },
];

test.describe('trang chủ', () => {
  for (const home of HOME_PAGES) {
    test(`${home.name}: lang, một h1, title, canonical, hreflang, og:image`, async ({ page }) => {
      await page.goto(home.path);

      await expect(page.locator('html')).toHaveAttribute('lang', home.lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(home.h1);
      await expect(page).toHaveTitle(home.title);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', home.canonical);
      const alternates = {
        vi: SITE_ORIGIN,
        en: `${SITE_ORIGIN}/en`,
        'x-default': SITE_ORIGIN,
      };
      for (const [hreflang, href] of Object.entries(alternates)) {
        await expect(
          page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`),
          `hreflang=${hreflang}`,
        ).toHaveAttribute('href', href);
      }

      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        home.ogImage,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        /^index, follow/,
      );
    });
  }

  test('ảnh Open Graph sinh lúc build trả đúng ảnh PNG cho cả hai ngôn ngữ', async ({
    request,
  }) => {
    for (const path of ['/opengraph-image', '/en/opengraph-image']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type'], path).toContain('image/png');
      expect((await response.body()).length, path).toBeGreaterThan(1_000);
    }
  });
});

test.describe('trang giới thiệu và chuyển ngôn ngữ', () => {
  test('LocaleSwitcher giữ nguyên trang: /about ↔ /en/about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(vi('about.title'));

    const toEnglish = page
      .getByRole('navigation', { name: vi('common.language.label') })
      .getByRole('link', { name: 'EN' });
    await expectHydrated(toEnglish);
    await toEnglish.click();

    await expect(page).toHaveURL('/en/about');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(en('about.title'));

    // Phải đợi hydrate: `onClick` của `<Link locale>` ghi lại cookie NEXT_LOCALE=vi; bấm sớm thì `/about` đi kèm cookie `en` và proxy
    // chuyển ngược về `/en/about` (`known-issues.md` §A).
    const toVietnamese = page
      .getByRole('navigation', { name: en('common.language.label') })
      .getByRole('link', { name: 'VI' });
    await expectHydrated(toVietnamese);
    await toVietnamese.click();

    await expect(page).toHaveURL('/about');
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.locator('h1')).toHaveText(vi('about.title'));
  });
});

test.describe('robots.txt và sitemap.xml', () => {
  test('robots.txt: cho lập chỉ mục, chặn vùng riêng tư + API, trỏ tới sitemap', async ({
    request,
  }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');

    const body = await response.text();
    expect(body).toMatch(/^User-Agent: \*$/im);
    expect(body).toMatch(/^Allow: \/$/m);
    for (const path of ['/api/', '/dashboard', '/demo', '/login', '/en/dashboard', '/en/login']) {
      expect(body, `Disallow ${path}`).toContain(`Disallow: ${path}`);
    }
    expect(body, 'không được chặn toàn site').not.toMatch(/^Disallow: \/$/m);
    expect(body).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
  });

  test('sitemap.xml: route công khai kèm hreflang, không có vùng riêng tư', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');

    const body = await response.text();
    for (const path of ['/', '/en', '/about', '/en/about']) {
      expect(body, `<loc> ${path}`).toContain(`<loc>${SITE_ORIGIN}${path}</loc>`);
    }
    expect(body).toContain('hreflang="en"');
    for (const path of ['/dashboard', '/login', '/demo', '/profile', '/settings']) {
      expect(body, `không có ${path}`).not.toContain(`${SITE_ORIGIN}${path}<`);
    }
  });
});

test.describe('header bảo mật', () => {
  test('mọi trang có header chính, không lộ X-Powered-By', async ({ request }) => {
    for (const path of ['/', '/about', '/login', '/robots.txt']) {
      const headers = (await request.get(path)).headers();
      expect(headers['x-content-type-options'], path).toBe('nosniff');
      expect(headers['x-frame-options'], path).toBe('SAMEORIGIN');
      expect(headers['referrer-policy'], path).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy'], path).toBe('camera=(), microphone=(), geolocation=()');
      expect(headers['strict-transport-security'], path).toContain('max-age=63072000');
      expect(headers['x-powered-by'], path).toBeUndefined();
    }
  });

  test('/api/* không được lập chỉ mục (X-Robots-Tag) và /api/health trả sống', async ({
    request,
  }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
  });
});
