/**
 * Metadata SEO — `buildRootMetadata` · `buildPageMetadata` · `buildPrivateMetadata` · `buildViewport` · gốc site.
 *
 * Hàm dựng đọc cấu hình lúc NẠP module (`appConfig` ← `NEXT_PUBLIC_*`, `serverConfig` ← biến server), nên mỗi kịch bản môi
 * trường nạp lại module bằng `vi.resetModules()` + `vi.stubEnv` — kiểm cả chuỗi env → cấu hình → metadata chứ không mock giữa chừng.
 * (`server-only` đã được thay bằng module rỗng ở `vitest.config.ts`.)
 *
 * Cái dễ làm hỏng nhất: Next KHÔNG gộp sâu các khối con — trang khai `robots: undefined` là xoá luôn khối `robots` của layout,
 * nên khoá `robots` phải VẮNG MẶT (không phải `undefined`) khi trang cho lập chỉ mục.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LOCALE, LOCALE_META, LOCALES } from '@/core/i18n';
import { ROOT_FILES } from '@tests/helpers/source-files';

type Seo = typeof import('@/core/seo');

/** Nạp lại `@/core/seo` với env đã đặt (khoá `undefined` = xoá biến). */
async function loadSeo(env: Record<string, string | undefined> = {}): Promise<Seo> {
  vi.resetModules();
  const base: Record<string, string | undefined> = {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_SITE_URL: 'https://example.com',
    SEO_ALLOW_INDEXING: 'true',
    GOOGLE_SITE_VERIFICATION: undefined,
    BING_SITE_VERIFICATION: undefined,
    VERCEL_ENV: undefined,
    VERCEL_PROJECT_PRODUCTION_URL: undefined,
  };
  for (const [key, value] of Object.entries({ ...base, ...env })) {
    // `vi.stubEnv(key, undefined)` xoá biến — cần để loại giá trị `.env` / CI của máy đang chạy.
    vi.stubEnv(key, value);
  }
  return import('@/core/seo');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const ORIGIN = 'https://example.com';
const ROOT_INPUT = {
  locale: 'vi',
  title: 'Test App — Tiêu đề',
  description: 'Mô tả site',
  keywords: ['a', 'b'],
} as const;

describe('gốc site — getSiteOrigin / getSiteName / isIndexingAllowed', () => {
  it('NEXT_PUBLIC_SITE_URL khai tường minh thắng mọi nguồn khác', async () => {
    const seo = await loadSeo({ VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.example' });
    expect(seo.getSiteOrigin()).toBe(ORIGIN);
    expect(seo.getSiteName()).toBe('Test App');
  });

  it('không khai → host production do Vercel cấp (thêm https://)', async () => {
    const seo = await loadSeo({
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.example',
    });
    expect(seo.getSiteOrigin()).toBe('https://app.vercel.example');
  });

  it('không khai gì → localhost:3000 (chỉ hợp lý lúc phát triển)', async () => {
    const seo = await loadSeo({ NEXT_PUBLIC_SITE_URL: undefined });
    expect(seo.getSiteOrigin()).toBe('http://localhost:3000');
  });

  it('cho lập chỉ mục theo SEO_ALLOW_INDEXING; preview của Vercel thì không', async () => {
    expect((await loadSeo()).isIndexingAllowed()).toBe(true);
    expect((await loadSeo({ SEO_ALLOW_INDEXING: 'false' })).isIndexingAllowed()).toBe(false);
    expect(
      (await loadSeo({ SEO_ALLOW_INDEXING: undefined, VERCEL_ENV: 'preview' })).isIndexingAllowed(),
    ).toBe(false);
  });
});

describe('buildRootMetadata', () => {
  it('nền chung: metadataBase, template tiêu đề, tên app, mô tả, từ khoá', async () => {
    const seo = await loadSeo();
    const meta = seo.buildRootMetadata(ROOT_INPUT);

    expect(String(meta.metadataBase)).toBe(`${ORIGIN}/`);
    expect(meta.title).toEqual({ default: ROOT_INPUT.title, template: '%s | Test App' });
    expect(meta.description).toBe(ROOT_INPUT.description);
    expect(meta.applicationName).toBe('Test App');
    expect(meta.keywords).toEqual(['a', 'b']);
  });

  it('Open Graph: ngôn ngữ hiện tại là `og:locale`, các ngôn ngữ còn lại là `alternateLocale`', async () => {
    const seo = await loadSeo();
    for (const locale of LOCALES) {
      const { openGraph } = seo.buildRootMetadata({ ...ROOT_INPUT, locale });
      expect(openGraph).toMatchObject({
        type: 'website',
        siteName: 'Test App',
        locale: LOCALE_META[locale].ogLocale,
      });
      expect(openGraph?.alternateLocale).toEqual(
        LOCALES.filter((item) => item !== locale).map((item) => LOCALE_META[item].ogLocale),
      );
    }
  });

  it('ảnh OG khai TƯỜNG MINH, tuyệt đối, đúng route theo ngôn ngữ, kích thước 1200×630 (cả OG lẫn Twitter)', async () => {
    const seo = await loadSeo();
    const vi = seo.buildRootMetadata({ ...ROOT_INPUT, locale: 'vi' });
    const en = seo.buildRootMetadata({ ...ROOT_INPUT, locale: 'en' });

    expect(vi.openGraph?.images).toEqual([
      { url: `${ORIGIN}/opengraph-image`, width: 1200, height: 630, alt: 'Test App' },
    ]);
    expect(en.openGraph?.images).toEqual([
      { url: `${ORIGIN}/en/opengraph-image`, width: 1200, height: 630, alt: 'Test App' },
    ]);
    expect(en.twitter).toMatchObject({ card: 'summary_large_image', images: en.openGraph?.images });
  });

  it('cho lập chỉ mục → index + follow + giới hạn xem trước cho googleBot', async () => {
    const meta = (await loadSeo()).buildRootMetadata(ROOT_INPUT);
    expect(meta.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    });
  });

  it('môi trường không được lập chỉ mục (preview / staging) → noindex, nofollow toàn site', async () => {
    const meta = (await loadSeo({ SEO_ALLOW_INDEXING: 'false' })).buildRootMetadata(ROOT_INPUT);
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('mã xác minh công cụ tìm kiếm chỉ có khi được khai (Bing đi qua `msvalidate.01`)', async () => {
    const none = (await loadSeo()).buildRootMetadata(ROOT_INPUT);
    expect(none.verification).toEqual({ google: undefined, other: undefined });

    const both = (
      await loadSeo({ GOOGLE_SITE_VERIFICATION: 'g-token', BING_SITE_VERIFICATION: 'b-token' })
    ).buildRootMetadata(ROOT_INPUT);
    expect(both.verification).toEqual({ google: 'g-token', other: { 'msvalidate.01': 'b-token' } });
  });

  it('PWA / iOS: manifest, icon, appleWebApp, không tự biến số thành link', async () => {
    const meta = (await loadSeo()).buildRootMetadata(ROOT_INPUT);
    expect(meta.manifest).toBe('/manifest.webmanifest');
    expect(meta.appleWebApp).toMatchObject({ capable: true, title: 'Test App' });
    expect(meta.formatDetection).toEqual({ telephone: false, email: false, address: false });
    expect(meta.icons).toMatchObject({ apple: [{ sizes: '180x180' }] });
  });
});

describe('buildPageMetadata', () => {
  const INPUT = { path: '/about', title: 'Giới thiệu', description: 'Mô tả trang' } as const;

  it.each(LOCALES)(
    'canonical + hreflang đủ ngôn ngữ + `x-default` (ngôn ngữ `%s`)',
    async (locale) => {
      const meta = (await loadSeo()).buildPageMetadata({ ...INPUT, locale });
      const localized = (item: (typeof LOCALES)[number]) =>
        item === DEFAULT_LOCALE ? `${ORIGIN}/about` : `${ORIGIN}/${item}/about`;

      expect(meta.alternates?.canonical).toBe(localized(locale));
      expect(meta.alternates?.languages).toEqual({
        vi: localized('vi'),
        en: localized('en'),
        'x-default': `${ORIGIN}/about`,
      });
      expect(meta.openGraph).toMatchObject({ url: localized(locale) });
    },
  );

  it('Open Graph: kiểu, tên site, `og:locale`, ảnh theo ngôn ngữ; Twitter dùng cùng ảnh', async () => {
    const meta = (await loadSeo()).buildPageMetadata({ ...INPUT, locale: 'en' });
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Test App',
      title: INPUT.title,
      description: INPUT.description,
      locale: 'en_US',
      alternateLocale: ['vi_VN'],
      images: [{ url: `${ORIGIN}/en/opengraph-image`, width: 1200, height: 630 }],
    });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: INPUT.title });
    expect(meta.twitter?.images).toEqual(meta.openGraph?.images);
  });

  it('⛔ cho lập chỉ mục → khoá `robots` VẮNG MẶT (không phải `undefined`): ghi đè sẽ xoá khối robots của layout', async () => {
    const meta = (await loadSeo()).buildPageMetadata({ ...INPUT, locale: 'vi' });
    expect(meta).not.toHaveProperty('robots');
    expect(Object.keys(meta)).not.toContain('robots');
  });

  it('`noIndex` → noindex, nofollow', async () => {
    const meta = (await loadSeo()).buildPageMetadata({ ...INPUT, locale: 'vi', noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('tiêu đề: mặc định theo template của layout; `absoluteTitle` bỏ `| Tên site`', async () => {
    const seo = await loadSeo();
    expect(seo.buildPageMetadata({ ...INPUT, locale: 'vi' }).title).toBe(INPUT.title);
    expect(seo.buildPageMetadata({ ...INPUT, locale: 'vi', absoluteTitle: true }).title).toEqual({
      absolute: INPUT.title,
    });
  });

  it('`ogType: article` đổi kiểu Open Graph', async () => {
    const meta = (await loadSeo()).buildPageMetadata({ ...INPUT, locale: 'vi', ogType: 'article' });
    expect(meta.openGraph).toMatchObject({ type: 'article' });
  });

  it('trang chủ: canonical `/` (vi) và `/en` (en), không dấu `/` thừa', async () => {
    const seo = await loadSeo();
    expect(seo.buildPageMetadata({ ...INPUT, path: '/', locale: 'vi' }).alternates?.canonical).toBe(
      `${ORIGIN}/`,
    );
    expect(seo.buildPageMetadata({ ...INPUT, path: '/', locale: 'en' }).alternates?.canonical).toBe(
      `${ORIGIN}/en`,
    );
  });
});

describe('buildPrivateMetadata', () => {
  it('noindex + canonical của chính trang (tránh nhân bản qua query string); không OG', async () => {
    const meta = (await loadSeo()).buildPrivateMetadata({
      locale: 'en',
      path: '/login',
      title: 'Đăng nhập',
    });
    expect(meta).toEqual({
      title: 'Đăng nhập',
      robots: { index: false, follow: false },
      alternates: { canonical: `${ORIGIN}/en/login` },
    });
  });
});

describe('buildViewport', () => {
  it('device-width, scale 1, viewport-fit=cover (iPad PWA cần để `env(safe-area-inset-*)` khác 0), không khoá phóng to', async () => {
    const viewport = (await loadSeo()).buildViewport();
    expect(viewport).toMatchObject({
      width: 'device-width',
      initialScale: 1,
      viewportFit: 'cover',
    });
    expect(viewport).not.toHaveProperty('maximumScale');
    expect(viewport).not.toHaveProperty('userScalable');
    expect(viewport.colorScheme).toBe('light dark');
  });

  it('`theme-color` có hai bản theo `prefers-color-scheme`, đúng `THEME_COLOR`', async () => {
    const seo = await loadSeo();
    expect(seo.buildViewport().themeColor).toEqual([
      { media: '(prefers-color-scheme: light)', color: seo.THEME_COLOR.light },
      { media: '(prefers-color-scheme: dark)', color: seo.THEME_COLOR.dark },
    ]);
  });

  it('`THEME_COLOR` = token `bg-page` của colors-theme.json (sáng · tối) — đổi bảng màu mà quên đổi đây là thanh trình duyệt lệch nền', async () => {
    const seo = await loadSeo();
    const config = JSON.parse(ROOT_FILES['src/styles/theme/colors-theme.json']) as {
      theme: Record<string, [string, string]>;
    };
    const [light, dark] = config.theme['bg-page'];
    expect(seo.THEME_COLOR.light.toLowerCase()).toBe(light.toLowerCase());
    expect(seo.THEME_COLOR.dark.toLowerCase()).toBe(dark.toLowerCase());
  });
});
