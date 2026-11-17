import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import {
  Button,
  Callout,
  Form,
  FormActions,
  PasswordField,
  TextField,
  showToast,
  useZodForm,
} from '@/shared/ui';
import AuthPageFrame from '../components/AuthPageFrame';
import { registerSchema, type RegisterFormValues } from '../schemas/auth.schema';
import { useRegister } from '../service/auth.queries';

const DEFAULTS: RegisterFormValues = { email: '', name: '', password: '', confirmPassword: '' };

const FOOTER = { prefix: 'Đã có tài khoản?', label: 'Đăng nhập', to: PATHS.LOGIN } as const;

/**
 * RegisterPage — trang đăng ký (`/register`); lỗi hiện bằng `Callout`, xong thì toast và về `/login`.
 *
 * Lưu ý: `confirmPassword` chỉ để đối chiếu ở client — payload gửi lên không có nó.
 * Lý do thiết kế: `docs/notes/code/auth.md`.
 */
const RegisterPage = memo(function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const form = useZodForm<RegisterFormValues>(registerSchema, { defaultValues: DEFAULTS });

  const handleSubmit = useCallback(
    async (values: RegisterFormValues) => {
      await register.mutateAsync({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      showToast('success', 'Tạo tài khoản thành công');
      // eslint-disable-next-line guard/login-redirect -- chưa có phiên: tạo tài khoản xong chuyển sang trang đăng nhập, không phải điều hướng theo phiên
      void navigate(PATHS.LOGIN, { replace: true });
    },
    [register, navigate],
  );

  return (
    <AuthPageFrame
      description="Điền thông tin bên dưới để bắt đầu."
      footer={FOOTER}
      title="Tạo tài khoản"
    >
      {register.isError && (
        <Callout intent="error">
          {errorMessageOf(register.error, 'Không tạo được tài khoản. Thử lại sau.')}
        </Callout>
      )}

      <Form form={form} onSubmit={handleSubmit}>
        <TextField autoFocus label="Họ tên" name="name" placeholder="Nguyễn Văn A" required />
        <TextField label="Email" name="email" placeholder="ban@congty.vn" required type="email" />
        <PasswordField label="Mật khẩu" name="password" placeholder="Tối thiểu 6 ký tự" required />
        <PasswordField label="Nhập lại mật khẩu" name="confirmPassword" required />

        <FormActions>
          <Button fullWidth loading={register.isPending} type="submit" variant="primary">
            Đăng ký
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default RegisterPage;
