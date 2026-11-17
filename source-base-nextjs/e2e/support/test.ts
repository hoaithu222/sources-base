import type { ConsoleMessage } from '@playwright/test';
import { expect, test as base } from '@playwright/test';

import { FakeApi } from './fake-api';

/**
 * `test` / `expect` của bộ e2e — mọi file `*.e2e.ts` import từ đây, không từ `@playwright/test`.
 *
 *   api            FakeApi đã gắn vào context (chỉ test nào xin mới có); xong test, mọi `/api/**` đã được giả
 *   consoleGuard   (tự chạy ở MỌI test) `pageerror` hoặc `console.error` ở bất kỳ trang nào là test đỏ — hydration mismatch,
 *                  lỗi runtime, chunk lỗi đều hiện ra ở đây mà jsdom không thấy
 */

interface Fixtures {
  api: FakeApi;
  consoleGuard: undefined;
}

/**
 * Nhiễu được bỏ qua — MỘT lý do: Chrome ghi `console.error` "Failed to load resource" cho mọi XHR trả không phải 2xx, mà
 * FakeApi cố ý trả 401 / 503 / ngắt kết nối cho `/api/auth/*` để kiểm nhánh lỗi. Việc app xử lý đúng lỗi đó do test từng
 * kịch bản khẳng định; lỗi tài nguyên ở đường khác (JS, CSS, font, ảnh) vẫn là lỗi thật.
 */
function isExpectedNoise(message: ConsoleMessage): boolean {
  return (
    message.text().startsWith('Failed to load resource') &&
    message.location().url.includes('/api/auth/')
  );
}

export const test = base.extend<Fixtures>({
  api: async ({ context }, provide) => {
    const api = await FakeApi.install(context);
    await provide(api);
    expect(
      api.unhandled,
      'Trang gọi /api chưa được FakeApi giả lập (e2e/support/fake-api.ts)',
    ).toEqual([]);
  },

  consoleGuard: [
    async ({ page }, provide) => {
      const problems: string[] = [];
      page.on('pageerror', (error) => problems.push(`pageerror — ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error' && !isExpectedNoise(message)) {
          problems.push(`console.error — ${message.text()} (${message.location().url})`);
        }
      });
      await provide(undefined);
      expect(problems, 'Trình duyệt báo lỗi lúc chạy').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
