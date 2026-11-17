'use client';

// eslint-disable-next-line no-restricted-imports -- ngoài provider i18n: chỉ cần pathname thô để đoán ngôn ngữ
import { usePathname } from 'next/navigation';

import { ErrorScreen } from '@/app/_components';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META } from '@/core/i18n/locales';
import type { Locale } from '@/core/i18n/locales';
import enErrors from '@/messages/en/errors.json';
import viErrors from '@/messages/vi/errors.json';

import '@/styles/globals.css';

const SCREENS = { vi: viErrors.screens, en: enErrors.screens } satisfies Record<Locale, unknown>;

/** Đoán ngôn ngữ từ tiền tố URL — `global-error` thay cả root layout nên KHÔNG có provider i18n. */
function localeOf(pathname: string): Locale {
  const first = pathname.split('/')[1];
  return LOCALES.find((locale) => locale === first && locale !== DEFAULT_LOCALE) ?? DEFAULT_LOCALE;
}

/**
 * global-error — lưới an toàn CUỐI: lỗi ném từ chính root layout (hoặc provider gốc) mà `error.tsx` không bắt được. Phải tự dựng
 * `<html>` / `<body>`; tự chọn chữ từ tệp thông điệp vì không có `NextIntlClientProvider`. Chỉ hoạt động ở production (dev hiện overlay lỗi).
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = localeOf(usePathname());
  const screens = SCREENS[locale];

  return (
    <html lang={LOCALE_META[locale].htmlLang}>
      <body>
        <ErrorScreen
          description={screens.error.description}
          level="app"
          primaryLabel={screens.error.action}
          title={screens.error.title}
          onPrimary={reset}
        />
      </body>
    </html>
  );
}
