import { defineRouting } from 'next-intl/routing';

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from './locales';

/**
 * routing — cấu hình định tuyến đa ngôn ngữ; `proxy.ts`, `navigation.ts` và `request.ts` cùng đọc nó.
 *
 * Lưu ý:  `localePrefix: 'as-needed'` — ngôn ngữ mặc định KHÔNG có tiền tố, nên URL tiếng Việt giữ nguyên
 *         khi thêm đa ngôn ngữ (không mất xếp hạng cũ). `alternateLinks: false` — hreflang do Metadata API
 *         (`@/core/seo`) xuất MỘT lần có kèm `x-default`, không để thêm header `Link` trùng lặp.
 */

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  alternateLinks: false,
  localeCookie: { name: LOCALE_COOKIE, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' },
});
