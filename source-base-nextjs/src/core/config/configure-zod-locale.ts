import { z } from 'zod';

import type { Locale } from '@/core/i18n';
import viValidation from '@/messages/vi/validation.json';

/**
 * configureZodLocale — đặt locale Zod toàn cục + bộ câu lỗi của validator theo ngôn ngữ đang hiển thị.
 *
 * Dùng:   configureZodLocale('vi', messages.validation);   // `LocaleSync` gọi khi ngôn ngữ đổi
 *         validationMessages().email                       // câu theo ngôn ngữ đang cấu hình (validator đọc LƯỜI lúc parse)
 *         fillValidationMessage(validationMessages().passwordMin, { min: 8 })   // điền `{min}` → "Mật khẩu tối thiểu 8 ký tự"
 * Lưu ý:  `string.min(1)` / `array.min(1)` không có message riêng → `messages.required` /
 *         `messages.selectAtLeastOne`; mọi message mặc định khác theo `z.locales.<locale>()` của Zod.
 *         Nguồn câu chữ là `src/messages/<locale>/validation.json` (khoá phẳng; chỗ `{tham_số}` do
 *         `fillValidationMessage` điền — KHÔNG đưa qua `t()` vì validator chạy ngoài React). Thêm câu mới → thêm
 *         khoá ở MỌI ngôn ngữ. Mặc định (chưa gọi `configureZodLocale`) là tiếng Việt để test / code chạy sớm vẫn có
 *         câu đọc được. Zod giữ cấu hình ở MỘT biến toàn cục — chỉ gọi ở trình duyệt (form chạy ở client), KHÔNG gọi
 *         trong Server Component: cấu hình sẽ rò giữa các request khác ngôn ngữ.
 */

export type ZodValidationMessages = typeof viValidation;

const ZOD_LOCALES: Record<Locale, () => ReturnType<typeof z.locales.vi>> = {
  vi: () => z.locales.vi(),
  en: () => z.locales.en(),
};

let current: ZodValidationMessages = viValidation;

/** Bộ câu lỗi của ngôn ngữ đang cấu hình (`configureZodLocale`); mặc định tiếng Việt. */
export function validationMessages(): ZodValidationMessages {
  return current;
}

/** Điền `{tên}` trong câu lỗi bằng giá trị tương ứng ở `params`; tham số thiếu giữ nguyên `{tên}`. */
export function fillValidationMessage(
  template: string,
  params: Readonly<Record<string, string | number>> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}

export function configureZodLocale(locale: Locale, messages: ZodValidationMessages): void {
  const base = ZOD_LOCALES[locale]();
  current = messages;

  z.config({
    localeError: (issue) => {
      if (issue.code === 'too_small' && issue.minimum === 1) {
        if (issue.origin === 'string') return messages.required;
        if (issue.origin === 'array') return messages.selectAtLeastOne;
      }
      return base.localeError(issue);
    },
  });
}
