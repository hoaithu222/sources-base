/**
 * Smoke khởi động app — mount THẬT cả cây provider + router trong jsdom.
 *
 * Đây là bài kiểm bắt được thứ mà `tsc` không thấy: import vòng, thiếu
 * provider, guard chuyển hướng sai, barrel trỏ vào file rỗng. Không có nó thì
 * "typecheck sạch + build xong" vẫn có thể ra màn hình trắng.
 *
 * Kiểm CẢ HAI chế độ của `appConfig.authEnabled`, vì hai chế độ dựng ra hai cây
 * route khác nhau và base xuất xưởng ở chế độ TẮT:
 *   - TẮT (mặc định base) → vào thẳng trang chủ, KHÔNG đá ra đăng nhập.
 *   - BẬT (dự án thật)    → chưa đăng nhập thì `AuthGuard` đưa về trang đăng nhập.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MockHandler } from '@tests/helpers/http-mock';

/**
 * `appConfig` đọc `import.meta.env` MỘT LẦN lúc nạp module, nên không đổi được
 * bằng cách gán biến môi trường trong test. Thay hẳn module là cách duy nhất
 * kiểm được cả hai chế độ.
 */
let restoreHttp: () => void = () => {};
let disposeApp: () => void = () => {};

async function renderApp(authEnabled: boolean, http: MockHandler) {
  vi.resetModules();
  const actual = await vi.importActual<typeof import('@/core/config')>('@/core/config');
  vi.doMock('@/core/config', () => ({
    ...actual,
    appConfig: { ...actual.appConfig, authEnabled },
  }));

  // Import SAU `resetModules`: mỗi lượt dựng app có bản `apiClient` riêng, nên
  // phải cài tầng mạng giả lên đúng bản mà app sắp dùng.
  const { mockHttp } = await import('@tests/helpers/http-mock');
  restoreHttp = mockHttp(http);

  const { bootstrapApp } = await import('@/app/bootstrap');
  const { default: App } = await import('@/app/App');

  // Đúng thứ tự của `main.tsx`: nối các tầng rồi mới render.
  disposeApp = bootstrapApp();
  render(<App />);
}

describe('khởi động app', () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.replaceState({}, '', '/');
    localStorage.clear();
  });
  afterEach(() => {
    restoreHttp();
    disposeApp();
  });

  it('tắt kiểm đăng nhập (chế độ demo) → vào thẳng trang chủ, KHÔNG gọi mạng', async () => {
    const http = vi.fn<MockHandler>(() => ({ status: 200, data: {} }));
    await renderApp(false, http);

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Bàn làm việc/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    // Demo không có backend — gọi refresh chỉ tạo request đỏ ở mọi lần tải trang.
    expect(http).not.toHaveBeenCalled();
  });

  it('bật kiểm đăng nhập, chưa có phiên → về trang đăng nhập', async () => {
    // Máy chủ đọc cookie và nói "không có phiên".
    await renderApp(true, () => ({ status: 401, data: {} }));

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Tìm ô nhập BẰNG NHÃN — đúng con đường của trình đọc màn hình. Regex vì
    // nhãn của field bắt buộc còn kèm dấu `*` phía sau.
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });
});
