'use client';

import { useLayoutEffect } from 'react';
import { useLocale, useMessages } from 'next-intl';

import { configureZodLocale } from '@/core/config';
import { configureErrorMessages } from '@/core/http';

/**
 * LocaleSync — đẩy ngôn ngữ đang hiển thị vào hai chỗ KHÔNG đi qua React: câu lỗi của tầng HTTP (`errors.http`) và locale
 * Zod toàn cục (thông báo validation mặc định). Chạy lại mỗi khi đổi ngôn ngữ.
 * Lưu ý: Zod giữ cấu hình ở biến toàn cục nên chỉ cấu hình ở trình duyệt (component này); server không bao giờ gọi.
 */
export default function LocaleSync() {
  const locale = useLocale();
  const messages = useMessages();

  useLayoutEffect(() => {
    configureErrorMessages(messages.errors.http);
    configureZodLocale(locale, messages.validation);
  }, [locale, messages]);

  return null;
}
