'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { errorMessageOf } from '@/core/http';
import { useRouter } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui/actions';
import { Callout } from '@/shared/ui/feedback';
import { Form, FormActions, PasswordField, TextField, useZodForm } from '@/shared/ui/form';
import { showToast } from '@/shared/ui/overlays';
import AuthPageFrame from '../components/AuthPageFrame';
import { PASSWORD_MIN_LENGTH } from '../schemas/auth.schema';
import type { RegisterFormValues } from '../schemas/auth.schema';
import { useAuthSchemas } from '../schemas/useAuthSchemas';
import { useRegister } from '../service/auth.queries';

const DEFAULTS: RegisterFormValues = { email: '', name: '', password: '', confirmPassword: '' };

/**
 * RegisterView — nội dung trang đăng ký (`/register`); lỗi hiện bằng `Callout`, xong thì toast và về `/login`.
 *
 * Lưu ý: `confirmPassword` chỉ để đối chiếu ở client — payload gửi lên không có nó.
 * Lý do thiết kế: `docs/notes/code/auth.md`.
 */
const RegisterView = memo(function RegisterView() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const { registerSchema } = useAuthSchemas();
  const register = useRegister();
  const form = useZodForm<RegisterFormValues>(registerSchema, { defaultValues: DEFAULTS });

  const handleSubmit = useCallback(
    async (values: RegisterFormValues) => {
      await register.mutateAsync({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      showToast('success', t('success'));
      // eslint-disable-next-line guard/login-redirect -- chưa có phiên: tạo tài khoản xong chuyển sang trang đăng nhập, không phải điều hướng theo phiên
      router.replace(PATHS.LOGIN);
    },
    [register, router, t],
  );

  const footer = { prefix: t('footerPrefix'), label: t('footerLabel'), href: PATHS.LOGIN };

  return (
    <AuthPageFrame description={t('description')} footer={footer} title={t('title')}>
      {register.isError && (
        <Callout intent="error">{errorMessageOf(register.error, t('failed'))}</Callout>
      )}

      <Form form={form} onSubmit={handleSubmit}>
        <TextField
          autoFocus
          label={t('name')}
          name="name"
          placeholder={t('namePlaceholder')}
          required
        />
        <TextField
          label={t('email')}
          name="email"
          placeholder={t('emailPlaceholder')}
          required
          type="email"
        />
        <PasswordField
          label={t('password')}
          name="password"
          placeholder={t('passwordPlaceholder', { min: PASSWORD_MIN_LENGTH })}
          required
        />
        <PasswordField label={t('confirmPassword')} name="confirmPassword" required />

        <FormActions>
          <Button fullWidth loading={register.isPending} type="submit" variant="primary">
            {t('submit')}
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default RegisterView;
