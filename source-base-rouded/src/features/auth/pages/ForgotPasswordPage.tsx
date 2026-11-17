import { memo, useCallback } from 'react';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button, Callout, Form, FormActions, TextField, useZodForm } from '@/shared/ui';
import AuthPageFrame from '../components/AuthPageFrame';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth.schema';
import { useForgotPassword } from '../service/auth.queries';

const DEFAULTS: ForgotPasswordFormValues = { email: '' };

const FOOTER = { label: 'Quay lại đăng nhập', to: PATHS.LOGIN } as const;

/**
 * ForgotPasswordPage — trang quên mật khẩu (`/forgot-password`); gửi được hay lỗi đều hiện bằng
 * `Callout` trên form, không toast.
 *
 * Lưu ý: câu thành công cố ý CHUNG, không xác nhận email có tồn tại — nói ra là lộ danh sách email
 * đã đăng ký.
 */
const ForgotPasswordPage = memo(function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const form = useZodForm<ForgotPasswordFormValues>(forgotPasswordSchema, {
    defaultValues: DEFAULTS,
  });

  const handleSubmit = useCallback(
    async (values: ForgotPasswordFormValues) => {
      await forgot.mutateAsync(values);
    },
    [forgot],
  );

  return (
    <AuthPageFrame
      description="Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu."
      footer={FOOTER}
      title="Quên mật khẩu"
    >
      {forgot.isSuccess && (
        <Callout intent="success">
          Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư.
        </Callout>
      )}
      {forgot.isError && (
        <Callout intent="error">
          {errorMessageOf(forgot.error, 'Không gửi được hướng dẫn. Thử lại sau.')}
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
        <FormActions>
          <Button fullWidth loading={forgot.isPending} type="submit" variant="primary">
            Gửi hướng dẫn
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default ForgotPasswordPage;
