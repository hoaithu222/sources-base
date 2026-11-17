import { z } from 'zod';

/**
 * configureZodLocale — đặt locale Zod toàn cục là tiếng Việt.
 *
 * Dùng:   configureZodLocale();   // một lần ở `app/bootstrap.ts`, trước khi parse schema nào
 * Lưu ý:  `string.min(1)` / `array.min(1)` không có message riêng → "Không được để trống" /
 *         "Bắt buộc chọn ít nhất 1 mục"; mọi message mặc định khác theo `z.locales.vi()`.
 */

const vi = z.locales.vi();

export function configureZodLocale() {
  z.config({
    localeError: (issue) => {
      if (issue.code === 'too_small' && issue.minimum === 1) {
        if (issue.origin === 'string') return 'Không được để trống';
        if (issue.origin === 'array') return 'Bắt buộc chọn ít nhất 1 mục';
      }
      return vi.localeError(issue);
    },
  });
}
