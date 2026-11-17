import type { MetadataRoute } from 'next';

import { appConfig } from '@/core/config';
import { DEFAULT_LOCALE, LOCALE_META } from '@/core/i18n';
import { loadMessages } from '@/core/i18n/server';
import { THEME_COLOR } from '@/core/seo';
import { PATHS } from '@/shared/constants/paths.constants';

/**
 * `/manifest.webmanifest` — PWA: cài được lên màn hình chính (iPad, Android, desktop). Manifest không theo ngôn ngữ của URL nên
 * dùng ngôn ngữ mặc định. Icon PNG sinh bằng `npm run generate:pwa-icons` (nguồn `public/favicon.svg`).
 * Lưu ý: `start_url` là bảng điều khiển — chưa đăng nhập thì `proxy.ts` đưa về `/login?next=…`.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const messages = await loadMessages(DEFAULT_LOCALE);

  return {
    name: appConfig.appName,
    short_name: appConfig.appName,
    description: messages.metadata.site.description,
    lang: LOCALE_META[DEFAULT_LOCALE].htmlLang,
    start_url: PATHS.DASHBOARD,
    scope: '/',
    display: 'standalone',
    background_color: THEME_COLOR.light,
    theme_color: THEME_COLOR.light,
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
