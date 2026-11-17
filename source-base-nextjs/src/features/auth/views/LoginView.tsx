'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui/actions';
import { Callout } from '@/shared/ui/feedback';
import { Form, FormActions, PasswordField, TextField, useZodForm } from '@/shared/ui/form';
import AuthLink from '../components/AuthLink';
import AuthPageFrame from '../components/AuthPageFrame';
import type { LoginFormValues } from '../schemas/auth.schema';
import { useAuthSchemas } from '../schemas/useAuthSchemas';
import { useLogin } from '../service/auth.queries';

const DEFAULTS: LoginFormValues = { email: '', password: '' };

/**
 * LoginView — nội dung trang đăng nhập (`/login`, bọc bởi `GuestGate`); lỗi hiện bằng `Callout` trên form.
 *
 * Lưu ý: KHÔNG tự điều hướng sau khi đăng nhập — `GuestGate` thấy phiên là đưa người dùng tới đích (`?next=` hoặc bảng điều khiển).
 * Lý do thiết kế: `docs/notes/code/auth.md`.
 */
const LoginView = memo(function LoginView() {
  const t = useTranslations('auth.login');
  const { loginSchema } = useAuthSchemas();
  const login = useLogin();
  const form = useZodForm<LoginFormValues>(loginSchema, { defaultValues: DEFAULTS });

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      await login.mutateAsync(values);
    },
    [login],
  );

  const footer = { prefix: t('footerPrefix'), label: t('footerLabel'), href: PATHS.REGISTER };

  return (
    <AuthPageFrame description={t('description')} footer={footer} title={t('title')}>
      {login.isError && (
        <Callout intent="error">{errorMessageOf(login.error, t('failed'))}</Callout>
      )}

      <Form form={form} onSubmit={handleSubmit}>
        <TextField
          autoFocus
          label={t('email')}
          name="email"
          placeholder={t('emailPlaceholder')}
          required
          type="email"
        />
        <PasswordField
          label={t('password')}
          name="password"
          placeholder={t('passwordPlaceholder')}
          required
        />

        <div className="flex justify-end">
          <AuthLink className="text-caption-12" href={PATHS.FORGOT_PASSWORD}>
            {t('forgot')}
          </AuthLink>
        </div>

        <FormActions>
          <Button fullWidth loading={login.isPending} type="submit" variant="primary">
            {t('submit')}
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default LoginView;
