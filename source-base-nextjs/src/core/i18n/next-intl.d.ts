import type { Locale } from './locales';
import type { Messages } from './messages';

/**
 * Cho next-intl biết kiểu `Locale` + `Messages` của dự án: `t('khoá.sai')` báo đỏ lúc gõ, `useLocale()` trả
 * `'vi' | 'en'` thay vì `string`.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
