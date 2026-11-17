import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as localeParam } from 'next/root-params';

import { loadMessages } from './messages';
import { routing } from './routing';

/**
 * Cấu hình theo từng request của next-intl (đăng ký ở `next.config.ts`) — chọn ngôn ngữ hợp lệ và nạp thông điệp.
 *
 * Ngôn ngữ lấy từ THAM SỐ GỐC của route (`next/root-params` — segment `[locale]` của root layout), KHÔNG từ header của request:
 * nhờ vậy mọi Server Component dùng chữ dịch vẫn prerender TĨNH (SSG) mà không phải gọi `setRequestLocale` ở từng layout / page —
 * API đó (và `requestLocale`) next-intl đã đánh dấu deprecated. Ngôn ngữ lạ (URL tay, bot) rơi về ngôn ngữ mặc định thay vì ném lỗi;
 * root layout gọi `requireLocale` để trả 404 đúng chuẩn cho chúng.
 */

export default getRequestConfig(async () => {
  const requested = await localeParam();
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return { locale, messages: await loadMessages(locale) };
});
