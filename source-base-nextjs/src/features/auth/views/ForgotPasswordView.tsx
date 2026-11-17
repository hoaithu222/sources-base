'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui/actions';
import { Callout } from '@/shared/ui/feedback';
import { Form, FormActions, TextField, useZodForm } from '@/shared/ui/form';
import AuthPageFrame from '../components/AuthPageFrame';
import type { ForgotPasswordFormValues } from '../schemas/auth.schema';
import { useAuthSchemas } from '../schemas/useAuthSchemas';
import { useForgotPassword } from '../service/auth.queries';

const DEFAULTS: ForgotPasswordFormValues = { email: '' };

/**
 * ForgotPasswordView — nội dung trang quên mật khẩu (`/forgot-password`); gửi được hay lỗi đều hiện bằng
 * `Callout` trên form, không toast.
 *
 * Lưu ý: câu thành công cố ý CHUNG, không xác nhận email có tồn tại — nói ra là lộ danh sách email
 * đã đăng ký.
 */
const ForgotPasswordView = memo(function ForgotPasswordView() {
  const t = useTranslations('auth.forgotPassword');
  const { forgotPasswordSchema } = useAuthSchemas();
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

  const footer = { label: t('footerLabel'), href: PATHS.LOGIN };

  return (
    <AuthPageFrame description={t('description')} footer={footer} title={t('title')}>
      {forgot.isSuccess && <Callout intent="success">{t('success')}</Callout>}
      {forgot.isError && (
        <Callout intent="error">{errorMessageOf(forgot.error, t('failed'))}</Callout>
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
        <FormActions>
          <Button fullWidth loading={forgot.isPending} type="submit" variant="primary">
            {t('submit')}
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default ForgotPasswordView;
