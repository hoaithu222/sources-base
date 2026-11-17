import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

import '@/styles/globals.css';

import { InlineScript } from '@/app/_components';
import { BaseProviders } from '@/app/_providers';
import { LOCALE_META, LOCALES } from '@/core/i18n';
import {
  getMessages,
  getTranslations,
  pickClientMessages,
  requireLocale,
} from '@/core/i18n/server';
import { buildRootMetadata, buildViewport } from '@/core/seo';
import { appearanceInitScript } from '@/domains/preferences/appearance-script';
import { cn } from '@/shared/utils/style/cn';

/**
 * Font tự host qua `next/font` (không request Google lúc chạy, font dự phòng canh số đo → ít lệch bố cục). Inter xin cả trục `opsz`;
 * Noto Sans / JetBrains Mono là font phụ nên `preload: false`. Biến CSS nối vào `--font-sans` / `--font-mono` ở `root-vars.css`.
 * `subsets` PHẢI là mảng literal tại chỗ gọi — `next/font` đọc option tĩnh lúc build.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans',
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'metadata.site' });

  return buildRootMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords') as string[],
  });
}

export const viewport: Viewport = buildViewport();

/**
 * Root layout — dựng `<html>` / `<body>` cho MỌI trang và nạp provider tối thiểu.
 *
 *   - `<html lang>` đúng ngôn ngữ (SEO + trình đọc màn hình); `suppressHydrationWarning` vì script khởi tạo đổi class / style
 *     của chính `<html>` (theme, TV, màu nhấn) TRƯỚC khi React hydrate — xem `appearanceInitScript`.
 *   - Giữ trang TĨNH (SSG): ngôn ngữ đọc từ tham số route (`core/i18n/request.ts`), không từ header / cookie.
 *   - Chỉ nhóm thông điệp trình duyệt cần (`CLIENT_NAMESPACES`) đi xuống client; nội dung SEO / trang tĩnh ở lại server.
 */
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const locale = requireLocale((await params).locale);
  const messages = await getMessages();

  return (
    <html
      className={cn(inter.variable, jetbrainsMono.variable, notoSans.variable)}
      lang={LOCALE_META[locale].htmlLang}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={appearanceInitScript()} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={pickClientMessages(messages)}>
          <BaseProviders>{children}</BaseProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
