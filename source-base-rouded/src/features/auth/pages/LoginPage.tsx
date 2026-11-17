import { memo, useCallback } from 'react';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import {
  Button,
  Callout,
  Form,
  FormActions,
  PasswordField,
  TextField,
  useZodForm,
} from '@/shared/ui';
import AuthLink from '../components/AuthLink';
import AuthPageFrame from '../components/AuthPageFrame';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';
import { useLogin } from '../service/auth.queries';

const DEFAULTS: LoginFormValues = { email: '', password: '' };

const FOOTER = { prefix: 'Chưa có tài khoản?', label: 'Đăng ký', to: PATHS.REGISTER } as const;

/**
 * LoginPage — trang đăng nhập (`/login`, bọc bởi `GuestGuard`); lỗi hiện bằng `Callout` trên form.
 *
 * Lưu ý: KHÔNG tự điều hướng sau khi đăng nhập — `GuestGuard` thấy phiên là đưa người dùng tới đích.
 * Lý do thiết kế: `docs/notes/code/auth.md`.
 */
const LoginPage = memo(function LoginPage() {
  const login = useLogin();
  const form = useZodForm<LoginFormValues>(loginSchema, { defaultValues: DEFAULTS });

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      await login.mutateAsync(values);
    },
    [login],
  );

  return (
    <AuthPageFrame
      description="Nhập email và mật khẩu để tiếp tục."
      footer={FOOTER}
      title="Đăng nhập"
    >
      {login.isError && (
        <Callout intent="error">
          {errorMessageOf(login.error, 'Không đăng nhập được. Thử lại sau.')}
        </Callout>
      )}

      <Form form={form} onSubmit={handleSubmit}>
        <TextField
          autoFocus
          label="Email"
          name="email"
          placeholder="ban@congty.vn"
          required
          type="email"
        />
        <PasswordField label="Mật khẩu" name="password" placeholder="••••••" required />

        <div className="flex justify-end">
          <AuthLink className="text-caption-12" to={PATHS.FORGOT_PASSWORD}>
            Quên mật khẩu?
          </AuthLink>
        </div>

        <FormActions>
          <Button fullWidth loading={login.isPending} type="submit" variant="primary">
            Đăng nhập
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default LoginPage;
