import type { Metadata, Viewport } from 'next';

import { serverConfig } from '@/core/config/server-config';
import { LOCALE_META, LOCALES } from '@/core/i18n';
import type { Locale } from '@/core/i18n';

import { getSiteName, getSiteOrigin, isIndexingAllowed, THEME_COLOR } from './site.config';
import { absoluteUrl, buildAlternates, localizedPath } from './url.utils';

/**
 * Dựng metadata SEO cho Next Metadata API — hai điểm vào:
 *
 *   buildRootMetadata(input)   ở `[locale]/layout.tsx`: nền chung (metadataBase, template tiêu đề, robots, OG…)
 *   buildPageMetadata(input)   ở `generateMetadata` của TỪNG trang: tiêu đề, mô tả, canonical, hreflang, OG, Twitter
 *   buildViewport()            ở `viewport` của root layout
 *
 * Lưu ý:  Next KHÔNG gộp sâu các khối con (`openGraph`, `twitter`, `robots`…): trang khai `openGraph` là thay
 *         nguyên khối của layout. Vì vậy `buildPageMetadata` lặp lại siteName / locale / type ở mỗi trang.
 *         Ảnh OG: route `app/[locale]/opengraph-image.tsx`, khai TƯỜNG MINH ở đây (`og:image` không tự gắn khi trang khai
 *         `openGraph`); trang cần ảnh riêng thì đặt `opengraph-image.tsx` cạnh `page.tsx` và ghi đè `images`.
 *         Chuỗi hiển thị (title, description) do CHỖ GỌI lấy từ `messages/<locale>/metadata.json` đưa vào.
 */

interface RootMetadataInput {
  locale: Locale;
  /** Tiêu đề mặc định (trang không khai title) — thường là "Tên site — khẩu hiệu". */
  title: string;
  description: string;
  keywords?: readonly string[];
}

/** Route ảnh Open Graph sinh theo ngôn ngữ (`app/[locale]/opengraph-image.tsx`), kích thước khớp `size` của file đó. */
const OG_IMAGE_PATH = '/opengraph-image';
const OG_IMAGE_SIZE = { width: 1200, height: 630 };

function ogImages(locale: Locale, origin: string, alt: string) {
  return [
    { url: absoluteUrl(origin, localizedPath(OG_IMAGE_PATH, locale)), ...OG_IMAGE_SIZE, alt },
  ];
}

function otherLocales(locale: Locale): string[] {
  return LOCALES.filter((item) => item !== locale).map((item) => LOCALE_META[item].ogLocale);
}

function buildRobots(allowIndex: boolean): Metadata['robots'] {
  if (!allowIndex) return { index: false, follow: false };
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

export function buildRootMetadata({
  locale,
  title,
  description,
  keywords,
}: RootMetadataInput): Metadata {
  const siteName = getSiteName();
  const origin = getSiteOrigin();

  return {
    metadataBase: new URL(origin),
    title: { default: title, template: `%s | ${siteName}` },
    description,
    applicationName: siteName,
    keywords: keywords ? [...keywords] : undefined,
    authors: [{ name: siteName, url: origin }],
    creator: siteName,
    publisher: siteName,
    referrer: 'origin-when-cross-origin',
    formatDetection: { telephone: false, email: false, address: false },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    appleWebApp: { capable: true, title: siteName, statusBarStyle: 'default' },
    robots: buildRobots(isIndexingAllowed()),
    verification: {
      google: serverConfig.googleSiteVerification,
      other: serverConfig.bingSiteVerification
        ? { 'msvalidate.01': serverConfig.bingSiteVerification }
        : undefined,
    },
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: otherLocales(locale),
      images: ogImages(locale, origin, siteName),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages(locale, origin, siteName),
    },
  };
}

interface PageMetadataInput {
  locale: Locale;
  /** Đường dẫn KHÔNG tiền tố ngôn ngữ, vd `/about` — nền của canonical + hreflang. */
  path: string;
  title: string;
  description: string;
  /** `true` → bỏ `| Tên site` (trang chủ đã có tên site trong tiêu đề). */
  absoluteTitle?: boolean;
  /** Trang riêng tư / trạng thái (đăng nhập, vùng làm việc, lỗi): không lập chỉ mục. */
  noIndex?: boolean;
  /** `article` cho bài viết; mặc định `website`. */
  ogType?: 'website' | 'article';
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  noIndex = false,
  ogType = 'website',
}: PageMetadataInput): Metadata {
  const siteName = getSiteName();
  const origin = getSiteOrigin();
  const alternates = buildAlternates(path, locale, origin);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: alternates.canonical, languages: alternates.languages },
    /** Khoá `robots` phải VẮNG MẶT khi cho lập chỉ mục: `robots: undefined` ở trang ghi đè luôn khối `robots` (index + googleBot) của layout. */
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: ogType,
      siteName,
      title,
      description,
      url: alternates.canonical,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: otherLocales(locale),
      images: ogImages(locale, origin, siteName),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages(locale, origin, siteName),
    },
  };
}

/** Trang không lập chỉ mục: chỉ cần tiêu đề; canonical vẫn đặt để tránh nhân bản qua query string. */
export function buildPrivateMetadata(input: {
  locale: Locale;
  path: string;
  title: string;
}): Metadata {
  return {
    title: input.title,
    robots: { index: false, follow: false },
    alternates: { canonical: buildAlternates(input.path, input.locale, getSiteOrigin()).canonical },
  };
}

export function buildViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    /** Bắt buộc cho iPad PWA: thiếu thì `env(safe-area-inset-*)` = 0 và vạch Home đè lên thanh neo đáy. */
    viewportFit: 'cover',
    colorScheme: 'light dark',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: THEME_COLOR.light },
      { media: '(prefers-color-scheme: dark)', color: THEME_COLOR.dark },
    ],
  };
}
