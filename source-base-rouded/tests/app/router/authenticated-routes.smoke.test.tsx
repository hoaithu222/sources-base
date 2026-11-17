/**
 * Route sau đăng nhập — trang phải RENDER được, không chỉ tồn tại trong bảng.
 *
 * Lỗi đã xảy ra thật: menu người dùng ở Header điều hướng tới `/profile` và
 * `/settings`, nhưng hai path đó không được mount → rơi vào catch-all `*` → ra
 * trang 404. `tests/app/router/app-routes.test.tsx` chặn việc khai path mà quên route;
 * bài này đi thêm một bước: dựng THẬT trang đó trong jsdom để chắc nó không
 * ném lỗi lúc render.
 *
 * Dùng `createMemoryRouter` với đúng `appRoutes` của app thay vì render trực tiếp
 * component — nếu chỉ render component thì guard, layout và lazy-load đều bị
 * bỏ qua, tức bỏ qua đúng những chỗ dễ hỏng.
 *
 * Nhóm `smoke` (đuôi `.smoke.test.tsx`): dựng cả cây app + nạp trang lười nên thời gian phụ thuộc số worker
 * chạy song song — ngưỡng 1 giây mặc định của `waitFor` từng đỏ ngẫu nhiên khi chạy cả bộ.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { PATHS } from '@/shared/constants/paths.constants';
import { appRoutes } from '@/app/router';
import { establishSession, useSessionStore } from '@/domains/session';
import { AppProvider } from '@/app/providers';

const USER = {
  id: 'u1',
  email: 'an@congty.vn',
  name: 'Nguyễn Văn An',
  roles: ['editor'],
  permissions: ['user:view'],
};

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  return render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
}

describe('route sau đăng nhập', () => {
  beforeEach(() => {
    useSessionStore.setState(useSessionStore.getInitialState(), true);
    // Guard chỉ nhìn `status` của phiên, không giải mã token — hạn thật do BE
    // chốt qua 401, nên chỗ này không cần dựng JWT hợp lệ.
    establishSession({ accessToken: 'test-token', user: USER });
  });

  it('/profile hiện hồ sơ người dùng đang đăng nhập', async () => {
    renderAt(PATHS.PROFILE);

    // ⛔ KHÔNG chờ tên/email: menu người dùng trên Header cũng in hai chuỗi đó,
    // nên chờ chúng là bài kiểm XANH GIẢ — trang hồ sơ có hỏng vẫn qua. Phải
    // chờ đúng thứ CHỈ trang này có.
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByText('Vai trò')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(screen.getByText('user:view')).toBeInTheDocument();
  });

  it('/settings hiện được trang cài đặt', async () => {
    renderAt(PATHS.SETTINGS);

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Cài đặt' })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByText('Chế độ màn hình lớn')).toBeInTheDocument();
  });

  it('URL không tồn tại thì ra trang 404, KHÔNG phải màn trắng', async () => {
    renderAt('/duong-dan-bia-ra');

    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
