/**
 * Màn hình xác thực — `src/features/auth`. VIEW quyết mọi phản hồi (Callout / toast / điều hướng), hook chỉ lo dữ liệu.
 *
 * Mỗi kết quả có ĐÚNG một phản hồi: lỗi → Callout trong trang (không toast tập trung chen vào); quên mật khẩu thành công → Callout
 * (không kèm toast); đăng ký / đặt lại xong → một toast rồi `router.replace('/login')` (Callout sẽ mất theo trang nên dùng toast).
 * Đăng nhập thành công KHÔNG tự điều hướng — `GuestGate` làm việc đó.
 * Thông báo kiểm lỗi (validation) theo ngôn ngữ đang hiển thị, tạo lại khi đổi ngôn ngữ.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import LocaleSync from '@/app/_providers/sync/LocaleSync';
import { configureZodLocale } from '@/core/config';
import { configureErrorMessages } from '@/core/http';
import { createQueryClient } from '@/core/query';
import type { Locale } from '@/core/i18n';
import { useSessionStore } from '@/domains/session';
import {
  ForgotPasswordView,
  LoginView,
  PASSWORD_MIN_LENGTH,
  RegisterView,
  ResetPasswordView,
  createAuthSchemas,
  useAuthSchemas,
} from '@/features/auth';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { showToast } from '@/shared/ui';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';
import { mockHttp } from '@tests/helpers/http-mock';
import type { MockHandler } from '@tests/helpers/http-mock';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { IntlWrapper } from '@tests/helpers/render';

const MESSAGES = { vi: viMessages, en: enMessages } satisfies Record<Locale, unknown>;

const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

/** QueryClient giống app — lỗi KHÔNG khai `silentError` sẽ thành toast, nên bắt được view quên `silentError`. */
function renderView(ui: ReactElement, { locale = 'vi' as Locale, search = '' } = {}) {
  navigationMock.setLocation('/', search);
  const client = createQueryClient({ notifyUser: (message) => showToast('error', message) });
  return render(
    <IntlWrapper locale={locale}>
      <LocaleSync />
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </IntlWrapper>,
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

const USER = { id: 'u1', email: 'an@congty.vn', name: 'An', roles: [], permissions: [] };

/** `Form` ghi console khi `onSubmit` ném — đó là hành vi đã biết khi BE từ chối; MỌI log khác (cảnh báo React, thiếu thông điệp) là lỗi. */
const EXPECTED_FORM_LOG = '[Form] onSubmit ném lỗi';
let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  useToastStore.setState({ toasts: [] });
  useSessionStore.setState(useSessionStore.getInitialState(), true);
});

afterEach(() => {
  const unexpected = consoleError.mock.calls.filter(
    ([first]) => !String(first).startsWith(EXPECTED_FORM_LOG),
  );
  consoleError.mockRestore();
  expect(unexpected).toEqual([]);
  restore();
  restore = () => {};
  configureErrorMessages(viMessages.errors.http);
  configureZodLocale('vi', viMessages.validation);
});

describe('createAuthSchemas / useAuthSchemas', () => {
  const schemasFor = (locale: Locale) => {
    const t = MESSAGES[locale].auth.validation;
    return createAuthSchemas({ ...t, passwordMin: t.passwordMin.replace('{min}', '6') });
  };

  const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
    result.error?.issues[0]?.message;

  it('đăng nhập: email trống / sai định dạng / mật khẩu ngắn báo đúng câu', () => {
    const { loginSchema } = schemasFor('vi');
    const messages = viMessages.auth.validation;

    expect(firstMessage(loginSchema.safeParse({ email: '', password: 'matkhau1' }))).toBe(
      messages.emailRequired,
    );
    expect(
      firstMessage(loginSchema.safeParse({ email: 'khong-phai-email', password: 'matkhau1' })),
    ).toBe(messages.emailInvalid);
    expect(firstMessage(loginSchema.safeParse({ email: 'an@congty.vn', password: '12345' }))).toBe(
      messages.passwordMin.replace('{min}', String(PASSWORD_MIN_LENGTH)),
    );
    expect(loginSchema.safeParse({ email: 'an@congty.vn', password: '123456' }).success).toBe(true);
  });

  it('email được cắt khoảng trắng đầu / cuối trước khi kiểm', () => {
    const { loginSchema } = schemasFor('vi');
    const result = loginSchema.safeParse({ email: '  an@congty.vn  ', password: 'matkhau1' });

    expect(result.success && result.data.email).toBe('an@congty.vn');
  });

  it('đăng ký: tên trống; mật khẩu xác nhận không khớp báo ở ô `confirmPassword`', () => {
    const { registerSchema } = schemasFor('en');
    const base = {
      email: 'an@congty.vn',
      name: 'An',
      password: 'matkhau1',
      confirmPassword: 'matkhau1',
    };

    expect(firstMessage(registerSchema.safeParse({ ...base, name: '   ' }))).toBe(
      'Name is required',
    );

    const mismatch = registerSchema.safeParse({ ...base, confirmPassword: 'khac-nhau' });
    expect(mismatch.error?.issues[0]).toMatchObject({
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('đặt lại mật khẩu: thiếu token → "Invalid token"; xác nhận trống → câu nhập lại', () => {
    const { resetPasswordSchema } = schemasFor('en');
    const base = { token: 'abc', password: 'matkhau1', confirmPassword: 'matkhau1' };

    expect(firstMessage(resetPasswordSchema.safeParse({ ...base, token: '' }))).toBe(
      'Invalid token',
    );
    expect(firstMessage(resetPasswordSchema.safeParse({ ...base, confirmPassword: '' }))).toBe(
      'Please re-enter your password',
    );
    expect(resetPasswordSchema.safeParse(base).success).toBe(true);
  });

  it('quên mật khẩu chỉ kiểm email', () => {
    const { forgotPasswordSchema } = schemasFor('vi');

    expect(forgotPasswordSchema.safeParse({ email: 'an@congty.vn' }).success).toBe(true);
    expect(firstMessage(forgotPasswordSchema.safeParse({ email: '' }))).toBe(
      viMessages.auth.validation.emailRequired,
    );
  });

  it('`useAuthSchemas` tạo lại schema theo ngôn ngữ hiện tại', () => {
    const messageIn = (locale: Locale) => {
      const { result } = renderHook(() => useAuthSchemas(), {
        wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
      });
      return firstMessage(result.current.loginSchema.safeParse({ email: '', password: '' }));
    };

    expect(messageIn('vi')).toBe(viMessages.auth.validation.emailRequired);
    expect(messageIn('en')).toBe('Email is required');
  });

  it('đổi ngôn ngữ trong cùng cây → schema đổi theo; ngôn ngữ không đổi thì giữ nguyên bản cũ', () => {
    let locale: Locale = 'vi';
    const { result, rerender } = renderHook(() => useAuthSchemas(), {
      wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
    });
    const emptyEmail = () =>
      firstMessage(result.current.loginSchema.safeParse({ email: '', password: '' }));
    const inVietnamese = result.current;
    expect(emptyEmail()).toBe(viMessages.auth.validation.emailRequired);

    rerender();
    expect(result.current).toBe(inVietnamese);

    locale = 'en';
    rerender();
    expect(result.current).not.toBe(inVietnamese);
    expect(emptyEmail()).toBe('Email is required');
  });

  it('thông báo mật khẩu tối thiểu mang đúng số ký tự', () => {
    const { result } = renderHook(() => useAuthSchemas(), {
      wrapper: ({ children }) => <IntlWrapper locale="en">{children}</IntlWrapper>,
    });

    expect(
      firstMessage(result.current.loginSchema.safeParse({ email: 'a@b.co', password: '1' })),
    ).toBe(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  });
});

describe('LoginView', () => {
  it('sai mật khẩu → Callout hiện câu của BE, không toast', async () => {
    serve(() => ({ status: 401, data: { error: { code: 'AUTH_001', message: 'Invalid' } } }));
    const user = userEvent.setup();
    const { container } = renderView(<LoginView />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'sai-mat-khau');
    await user.click(screen.getByRole('button', { name: viMessages.auth.login.submit }));

    expect(await screen.findByText('Email hoặc mật khẩu không đúng')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });

  it('câu lỗi của BE theo ngôn ngữ đang hiển thị (LocaleSync đã cấu hình tầng HTTP)', async () => {
    serve(() => ({ status: 401, data: { error: { code: 'AUTH_001', message: 'Invalid' } } }));
    const user = userEvent.setup();
    const { container } = renderView(<LoginView />, { locale: 'en' });

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Incorrect email or password')).toBeInTheDocument();
  });

  it('đăng nhập được → xác lập phiên và KHÔNG tự điều hướng (GuestGate lo)', async () => {
    serve(() => ({
      status: 200,
      data: { data: { accessToken: 'token-moi', user: USER } },
    }));
    const user = userEvent.setup();
    const { container } = renderView(<LoginView />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'matkhau1');
    await user.click(screen.getByRole('button', { name: viMessages.auth.login.submit }));

    await waitFor(() => expect(useSessionStore.getState().status).toBe('authenticated'));
    expect(useSessionStore.getState().user).toMatchObject({ id: 'u1' });
    expect(navigationMock.replace).not.toHaveBeenCalled();
    expect(navigationMock.push).not.toHaveBeenCalled();
    expect(toastTitles()).toEqual([]);
  });

  it('gửi form trống → hiện câu kiểm lỗi ĐÃ DỊCH (tiếng Anh) và KHÔNG gọi mạng', async () => {
    let calls = 0;
    serve(() => {
      calls += 1;
      return { status: 200, data: {} };
    });
    const user = userEvent.setup();
    renderView(<LoginView />, { locale: 'en' });

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(
      screen.getByText(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    ).toBeInTheDocument();
    expect(calls).toBe(0);
  });

  it('cùng thao tác bằng tiếng Việt → câu kiểm lỗi tiếng Việt', async () => {
    const user = userEvent.setup();
    renderView(<LoginView />);

    await user.click(screen.getByRole('button', { name: viMessages.auth.login.submit }));

    expect(await screen.findByText(viMessages.auth.validation.emailRequired)).toBeInTheDocument();
  });

  it('có liên kết tới quên mật khẩu và đăng ký, đúng tiền tố ngôn ngữ', () => {
    const view = renderView(<LoginView />);
    expect(screen.getByRole('link', { name: viMessages.auth.login.forgot })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: viMessages.auth.login.footerLabel })).toHaveAttribute(
      'href',
      '/register',
    );
    view.unmount();

    renderView(<LoginView />, { locale: 'en' });
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/en/forgot-password',
    );
  });
});

describe('RegisterView', () => {
  it('đăng ký xong → một toast thành công rồi replace về /login; payload KHÔNG có confirmPassword', async () => {
    const bodies: unknown[] = [];
    serve((config) => {
      bodies.push(JSON.parse(String(config.data)));
      return { status: 200, data: { data: null } };
    });
    const user = userEvent.setup();
    const { container } = renderView(<RegisterView />);

    await user.type(inputNamed(container, 'name'), 'Nguyễn Văn An');
    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'matkhau1');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau1');
    await user.click(screen.getByRole('button', { name: viMessages.auth.register.submit }));

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/login'));
    expect(toastTitles()).toEqual([viMessages.auth.register.success]);
    expect(bodies).toEqual([
      { email: 'an@congty.vn', name: 'Nguyễn Văn An', password: 'matkhau1' },
    ]);
  });

  it('bản tiếng Anh: toast tiếng Anh và về /login (replace dùng đường chưa tiền tố, next-intl lo phần còn lại)', async () => {
    serve(() => ({ status: 200, data: { data: null } }));
    const user = userEvent.setup();
    const { container } = renderView(<RegisterView />, { locale: 'en' });

    await user.type(inputNamed(container, 'name'), 'Jane Doe');
    await user.type(inputNamed(container, 'email'), 'jane@company.com');
    await user.type(inputNamed(container, 'password'), 'secret123');
    await user.type(inputNamed(container, 'confirmPassword'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/en/login'));
    expect(toastTitles()).toEqual(['Account created successfully']);
  });

  it('xác nhận mật khẩu không khớp → báo ở ô xác nhận, KHÔNG gọi mạng, không điều hướng', async () => {
    let calls = 0;
    serve(() => {
      calls += 1;
      return { status: 200, data: {} };
    });
    const user = userEvent.setup();
    const { container } = renderView(<RegisterView />, { locale: 'en' });

    await user.type(inputNamed(container, 'name'), 'Jane Doe');
    await user.type(inputNamed(container, 'email'), 'jane@company.com');
    await user.type(inputNamed(container, 'password'), 'secret123');
    await user.type(inputNamed(container, 'confirmPassword'), 'different');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(calls).toBe(0);
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('BE từ chối (email đã dùng) → Callout lỗi trong trang, không toast, không điều hướng', async () => {
    serve(() => ({ status: 409, data: { error: { code: 'USER_002', message: 'dup' } } }));
    const user = userEvent.setup();
    const { container } = renderView(<RegisterView />);

    await user.type(inputNamed(container, 'name'), 'Nguyễn Văn An');
    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.type(inputNamed(container, 'password'), 'matkhau1');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau1');
    await user.click(screen.getByRole('button', { name: viMessages.auth.register.submit }));

    expect(await screen.findByText('Email đã được sử dụng')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });
});

describe('ForgotPasswordView', () => {
  it('gửi được → CHỈ một phản hồi: Callout thành công, không toast', async () => {
    serve(() => ({ status: 200, data: { data: null } }));
    const user = userEvent.setup();
    const { container } = renderView(<ForgotPasswordView />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.click(screen.getByRole('button', { name: viMessages.auth.forgotPassword.submit }));

    expect(await screen.findByText(/hướng dẫn đặt lại mật khẩu đã được gửi/)).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });

  it('máy chủ lỗi → Callout lỗi trong trang, không toast tập trung', async () => {
    serve(() => ({ status: 500, data: {} }));
    const user = userEvent.setup();
    const { container } = renderView(<ForgotPasswordView />);

    await user.type(inputNamed(container, 'email'), 'an@congty.vn');
    await user.click(screen.getByRole('button', { name: viMessages.auth.forgotPassword.submit }));

    expect(await screen.findByText('Lỗi máy chủ nội bộ')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });

  it('email sai định dạng → câu kiểm lỗi theo ngôn ngữ, không gọi mạng', async () => {
    let calls = 0;
    serve(() => {
      calls += 1;
      return { status: 200, data: {} };
    });
    const user = userEvent.setup();
    const { container } = renderView(<ForgotPasswordView />, { locale: 'en' });

    await user.type(inputNamed(container, 'email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send instructions' }));

    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(calls).toBe(0);
  });
});

describe('ResetPasswordView', () => {
  it('thiếu token → màn "Liên kết không hợp lệ", không có form, có đường xin lại hướng dẫn', () => {
    renderView(<ResetPasswordView />);

    expect(screen.getByText(viMessages.auth.resetPassword.invalidLink.title)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: viMessages.auth.resetPassword.submit }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: viMessages.auth.resetPassword.invalidLink.action }),
    ).toHaveAttribute('href', '/forgot-password');
  });

  it('token rỗng (`?token=`) cũng là liên kết không hợp lệ; bản tiếng Anh', () => {
    renderView(<ResetPasswordView />, { locale: 'en', search: '?token=' });

    expect(screen.getByText('Invalid link')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resend instructions' })).toHaveAttribute(
      'href',
      '/en/forgot-password',
    );
  });

  it('đặt lại xong → gửi `newPassword` (không `confirmPassword`), một toast rồi replace về /login', async () => {
    const bodies: unknown[] = [];
    serve((config) => {
      bodies.push(JSON.parse(String(config.data)));
      return { status: 200, data: { data: null } };
    });
    const user = userEvent.setup();
    const { container } = renderView(<ResetPasswordView />, { search: '?token=ma-1-lan' });

    await user.type(inputNamed(container, 'password'), 'matkhau-moi');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau-moi');
    await user.click(screen.getByRole('button', { name: viMessages.auth.resetPassword.submit }));

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/login'));
    expect(bodies).toEqual([{ token: 'ma-1-lan', newPassword: 'matkhau-moi' }]);
    expect(toastTitles()).toEqual([viMessages.auth.resetPassword.success]);
  });

  it('đổi `?token=` khi trang còn mount → gửi token MỚI, không phải token lúc mount', async () => {
    const bodies: unknown[] = [];
    serve((config) => {
      bodies.push(JSON.parse(String(config.data)));
      return { status: 200, data: { data: null } };
    });
    const user = userEvent.setup();
    const { container } = renderView(<ResetPasswordView />, { search: '?token=cu' });

    act(() => navigationMock.setLocation('/', '?token=moi'));
    await user.type(inputNamed(container, 'password'), 'matkhau-moi');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau-moi');
    await user.click(screen.getByRole('button', { name: viMessages.auth.resetPassword.submit }));

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/login'));
    expect(bodies).toEqual([{ token: 'moi', newPassword: 'matkhau-moi' }]);
  });

  it('BE từ chối token hết hạn → Callout lỗi, không toast, không điều hướng', async () => {
    serve(() => ({ status: 400, data: { error: { code: 'AUTH_002', message: 'bad token' } } }));
    const user = userEvent.setup();
    const { container } = renderView(<ResetPasswordView />, { search: '?token=het-han' });

    await user.type(inputNamed(container, 'password'), 'matkhau-moi');
    await user.type(inputNamed(container, 'confirmPassword'), 'matkhau-moi');
    await user.click(screen.getByRole('button', { name: viMessages.auth.resetPassword.submit }));

    expect(await screen.findByText('Token không hợp lệ')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('xác nhận không khớp → câu kiểm lỗi theo ngôn ngữ, không gọi mạng', async () => {
    let calls = 0;
    serve(() => {
      calls += 1;
      return { status: 200, data: {} };
    });
    const user = userEvent.setup();
    const { container } = renderView(<ResetPasswordView />, { locale: 'en', search: '?token=abc' });

    await user.type(inputNamed(container, 'password'), 'matkhau-moi');
    await user.type(inputNamed(container, 'confirmPassword'), 'khac-nhau');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(calls).toBe(0);
  });
});
