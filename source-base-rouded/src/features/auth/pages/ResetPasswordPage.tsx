import { memo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import {
  Button,
  Callout,
  Form,
  FormActions,
  PasswordField,
  showToast,
  useZodForm,
} from '@/shared/ui';
import AuthPageFrame from '../components/AuthPageFrame';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/auth.schema';
import { useResetPassword } from '../service/auth.queries';

const FOOTER = { label: 'Quay lại đăng nhập', to: PATHS.LOGIN } as const;

/**
 * ResetPasswordPage — trang đặt lại mật khẩu (`/reset-password?token=…`, link trong email); lỗi hiện
 * bằng `Callout`, xong thì toast rồi về `/login`.
 *
 * Lưu ý: thiếu `token` → màn "Liên kết không hợp lệ", không hiện form; submit đổi `password` →
 * `newPassword` và bỏ `confirmPassword`. Lý do thiết kế: `docs/notes/code/auth.md`.
 */
const ResetPasswordPage = memo(function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reset = useResetPassword();

  const token = params.get('token') ?? '';

  const form = useZodForm<ResetPasswordFormValues>(resetPasswordSchema, {
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  const handleSubmit = useCallback(
    async (values: ResetPasswordFormValues) => {
      await reset.mutateAsync({ token: values.token, newPassword: values.password });
      showToast('success', 'Đặt lại mật khẩu thành công');
      // eslint-disable-next-line guard/login-redirect -- chưa có phiên: đặt lại mật khẩu xong chuyển sang trang đăng nhập, không phải điều hướng theo phiên
      void navigate(PATHS.LOGIN, { replace: true });
    },
    [reset, navigate],
  );

  if (!token) {
    return (
      <AuthPageFrame title="Liên kết không hợp lệ">
        <Callout intent="error">
          Liên kết đặt lại mật khẩu thiếu mã xác thực hoặc đã hết hạn. Hãy yêu cầu gửi lại.
        </Callout>
        <Button asChild fullWidth variant="primary">
          <Link to={PATHS.FORGOT_PASSWORD}>Gửi lại hướng dẫn</Link>
        </Button>
      </AuthPageFrame>
    );
  }

  return (
    <AuthPageFrame
      description="Nhập mật khẩu mới cho tài khoản của bạn."
      footer={FOOTER}
      title="Đặt lại mật khẩu"
    >
      {reset.isError && (
        <Callout intent="error">
          {errorMessageOf(reset.error, 'Không đặt lại được mật khẩu. Thử lại sau.')}
        </Callout>
      )}

      <Form form={form} onSubmit={handleSubmit}>
        <PasswordField autoFocus label="Mật khẩu mới" name="password" required />
        <PasswordField label="Nhập lại mật khẩu" name="confirmPassword" required />
        <FormActions>
          <Button fullWidth loading={reset.isPending} type="submit" variant="primary">
            Đặt lại mật khẩu
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default ResetPasswordPage;
