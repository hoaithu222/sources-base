import { notFound } from 'next/navigation';

import { isLocale } from './locales';
import type { Locale } from './locales';

/**
 * Điểm vào CHỈ DÀNH CHO SERVER của i18n — dùng trong Server Component, `generateMetadata`, `sitemap.ts`.
 *
 *   requireLocale(params.locale)  thu hẹp `string` của URL thành `Locale`; ngôn ngữ lạ → `notFound()` (404 đúng chuẩn)
 *   getTranslations(namespace)    như `useTranslations` nhưng cho hàm async (`generateMetadata`)
 *   getMessages / getLocale       thông điệp / ngôn ngữ của request hiện tại
 *   loadMessages / pickClientMessages   cắt thông điệp gửi xuống client
 *
 * Lưu ý:  ⛔ Client Component KHÔNG import file này — dùng `@/core/i18n`. KHÔNG cần `setRequestLocale`: ngôn ngữ đến từ
 *         `next/root-params` (xem `request.ts`), trang vẫn tĩnh.
 */

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export { getFormatter, getLocale, getMessages, getTranslations } from 'next-intl/server';
export { loadMessages, pickClientMessages } from './messages';
