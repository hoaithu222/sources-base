import type viMessages from '@/messages/vi';

import type { Locale } from './locales';

/** Hình dạng thông điệp — suy từ bản tiếng Việt (nguồn); các ngôn ngữ khác PHẢI khớp (`en/index.ts`). */
export type Messages = typeof viMessages;

/** Namespace gửi xuống trình duyệt qua `NextIntlClientProvider`; phần còn lại chỉ dùng ở server. */
export const CLIENT_NAMESPACES = [
  'common',
  'errors',
  'validation',
  'ui',
  'auth',
  'shell',
  'account',
  'customers',
  'demo',
] as const satisfies readonly (keyof Messages)[];

type ClientNamespace = (typeof CLIENT_NAMESPACES)[number];

const LOADERS: Record<Locale, () => Promise<{ default: Messages }>> = {
  vi: () => import('@/messages/vi'),
  en: () => import('@/messages/en'),
};

/** Nạp toàn bộ thông điệp của một ngôn ngữ (chỉ gọi ở server). */
export async function loadMessages(locale: Locale): Promise<Messages> {
  return (await LOADERS[locale]()).default;
}

/** Cắt phần thông điệp trình duyệt cần — giữ bundle nhỏ, không gửi nội dung SEO / trang tĩnh xuống client. */
export function pickClientMessages(messages: Messages): Pick<Messages, ClientNamespace> {
  return Object.fromEntries(CLIENT_NAMESPACES.map((name) => [name, messages[name]])) as Pick<
    Messages,
    ClientNamespace
  >;
}
