/**
 * Trang xác thực — TRANG quyết mọi phản hồi (Callout / toast / điều hướng), hook chỉ lo dữ liệu.
 *
 * Mỗi kết quả có ĐÚNG một phản hồi: lỗi → Callout trong trang (không toast tập trung chen vào);
 * quên mật khẩu thành công → Callout (không kèm toast); đăng ký / đặt lại xong → một toast rồi về
 * `/login` (Callout sẽ mất theo trang nên dùng toast).
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createQueryClient } from '@/core/query';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import { showToast } from '@/shared/ui';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';

import { mockHttp } from '@tests/helpers/http-mock';
import type { MockHandler } from '@tests/helpers/http-mock';

const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

/**
 * Dựng trang trong data router (Form dùng `useBlocker`) + QueryClient giống app — lỗi không khai
 * `silentError` sẽ thành toast.
 */
function renderPage(path: string, page: ReactElement) {
  const client = createQueryClient({ notifyUser: (message) => showToast('error', message) });
  const router = createMemoryRouter(
    [
      { path: path.split('?')[0], element: page },
      { path: '/login', element: <p>Trang đăng nhập</p> },
    ],
    { initialEntries: [path] },
  );
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const inputNamed = (container: HTMLElement, name: string) => {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) throw new Error(`Không thấy ô "${name}"`);
  return input;
};

let restore: () => void = () => {};
const serve = (handler: MockHandler) => {
  restore = mockHttp(handler);
};

beforeEach(() => useToastStore.setState({ toasts: [] }));
afterEach(() => restore());

describe('LoginPage', () => {
  it('sai mật khẩu → Callout hiện câu của BE, không toast', async () => {
    serve(() => ({ status: 401, data: { error: { code: 'AUTH_001', message: 'Invalid' } } }));
    const user = userEvent.setup();
    const { container } = renderPage('/login', <LoginPage />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'sai-mat-khau');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(await screen.findByText('Email hoặc mật khẩu không đúng')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });
});

describe('ForgotPasswordPage', () => {
  it('gửi được → CHỈ một phản hồi: Callout thành công, không toast', async () => {
    serve(() => ({ status: 200, data: { data: null } }));
    const user = userEvent.setup();
    const { container } = renderPage('/forgot-password', <ForgotPasswordPage />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.click(screen.getByRole('button', { name: 'Gửi hướng dẫn' }));

    expect(await screen.findByText(/hướng dẫn đặt lại mật khẩu đã được gửi/)).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });

  it('máy chủ lỗi → Callout lỗi trong trang, không toast tập trung', async () => {
    serve(() => ({ status: 500, data: {} }));
    const user = userEvent.setup();
    const { container } = renderPage('/forgot-password', <ForgotPasswordPage />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.click(screen.getByRole('button', { name: 'Gửi hướng dẫn' }));

    expect(await screen.findByText('Lỗi máy chủ nội bộ')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });
});

describe('RegisterPage', () => {
  it('đăng ký xong → một toast thành công rồi về /login', async () => {
    serve(() => ({ status: 200, data: { data: null } }));
    const user = userEvent.setup();
    const { container } = renderPage('/register', <RegisterPage />);

    await user.type(inputNamed(container, 'name'), 'Nguyễn Văn An');
    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'matkhau1');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau1');
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }));

    expect(await screen.findByText('Trang đăng nhập')).toBeInTheDocument();
    expect(toastTitles()).toEqual(['Tạo tài khoản thành công']);
  });
});

describe('ResetPasswordPage', () => {
  it('thiếu token → màn "Liên kết không hợp lệ", không có form', () => {
    renderPage('/reset-password', <ResetPasswordPage />);

    expect(screen.getByText('Liên kết không hợp lệ')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đặt lại mật khẩu' })).not.toBeInTheDocument();
  });

  it('đặt lại xong → gửi `newPassword` (không `confirmPassword`), một toast rồi về /login', async () => {
    const bodies: unknown[] = [];
    serve((config) => {
      bodies.push(JSON.parse(String(config.data)));
      return { status: 200, data: { data: null } };
    });
    const user = userEvent.setup();
    const { container } = renderPage('/reset-password?token=ma-1-lan', <ResetPasswordPage />);

    await user.type(inputNamed(container, 'password'), 'matkhau-moi');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau-moi');
    await user.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }));

    await waitFor(() => expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument());
    expect(bodies).toEqual([{ token: 'ma-1-lan', newPassword: 'matkhau-moi' }]);
    expect(toastTitles()).toEqual(['Đặt lại mật khẩu thành công']);
  });
});
