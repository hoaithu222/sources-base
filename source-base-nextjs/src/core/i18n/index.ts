/**
 * Đa ngôn ngữ (next-intl) — điểm vào dùng được ở CẢ server lẫn client.
 *
 *   Link · useRouter · usePathname · redirect   điều hướng tự thêm tiền tố ngôn ngữ (`navigation.ts`)
 *   routing · LOCALES · DEFAULT_LOCALE          cấu hình định tuyến (`proxy.ts`, `generateStaticParams`)
 *   LOCALE_META · isLocale                      nhãn, hreflang, og:locale của từng ngôn ngữ
 *
 * Dùng thông điệp: `useTranslations('namespace')` từ `next-intl`; ở server: `@/core/i18n/server`.
 * Hướng dẫn thêm chuỗi / ngôn ngữ: `docs/guides/i18n.md`.
 */

export { Link, getPathname, redirect, usePathname, useRouter } from './navigation';
export { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, LOCALE_META, isLocale } from './locales';
export { routing } from './routing';
export { CLIENT_NAMESPACES } from './messages';
export type { Locale } from './locales';
export type { Messages } from './messages';
