'use client';

import { memo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { errorMessageOf } from '@/core/http';
import { Link, useRouter } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui/actions';
import { Callout } from '@/shared/ui/feedback';
import { Form, FormActions, PasswordField, useZodForm } from '@/shared/ui/form';
import { showToast } from '@/shared/ui/overlays';
import AuthPageFrame from '../components/AuthPageFrame';
import type { ResetPasswordFormValues } from '../schemas/auth.schema';
import { useAuthSchemas } from '../schemas/useAuthSchemas';
import { useResetPassword } from '../service/auth.queries';

/**
 * ResetPasswordView — nội dung trang đặt lại mật khẩu (`/reset-password?token=…`, link trong email); lỗi hiện
 * bằng `Callout`, xong thì toast rồi về `/login`.
 *
 * Lưu ý: thiếu `token` → màn "Liên kết không hợp lệ", không hiện form; token gửi đi là token trên URL LÚC GỬI (không phải
 * giá trị lúc mount); submit đổi `password` →
 * `newPassword` và bỏ `confirmPassword`. Đọc `useSearchParams` nên `page.tsx` PHẢI bọc view này trong `<Suspense>`.
 * Lý do thiết kế: `docs/notes/code/auth.md`.
 */
const ResetPasswordView = memo(function ResetPasswordView() {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const params = useSearchParams();
  const { resetPasswordSchema } = useAuthSchemas();
  const reset = useResetPassword();

  const token = params.get('token') ?? '';

  const form = useZodForm<ResetPasswordFormValues>(resetPasswordSchema, {
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  const handleSubmit = useCallback(
    async (values: ResetPasswordFormValues) => {
      await reset.mutateAsync({ token, newPassword: values.password });
      showToast('success', t('success'));
      // eslint-disable-next-line guard/login-redirect -- chưa có phiên: đặt lại mật khẩu xong chuyển sang trang đăng nhập, không phải điều hướng theo phiên
      router.replace(PATHS.LOGIN);
    },
    [reset, router, t, token],
  );

  if (!token) {
    return (
      <AuthPageFrame title={t('invalidLink.title')}>
        <Callout intent="error">{t('invalidLink.description')}</Callout>
        <Button asChild fullWidth variant="primary">
          <Link href={PATHS.FORGOT_PASSWORD}>{t('invalidLink.action')}</Link>
        </Button>
      </AuthPageFrame>
    );
  }

  const footer = { label: t('footerLabel'), href: PATHS.LOGIN };

  return (
    <AuthPageFrame description={t('description')} footer={footer} title={t('title')}>
      {reset.isError && (
        <Callout intent="error">{errorMessageOf(reset.error, t('failed'))}</Callout>
      )}

      <Form form={form} onSubmit={handleSubmit}>
        <PasswordField autoFocus label={t('newPassword')} name="password" required />
        <PasswordField label={t('confirmPassword')} name="confirmPassword" required />
        <FormActions>
          <Button fullWidth loading={reset.isPending} type="submit" variant="primary">
            {t('submit')}
          </Button>
        </FormActions>
      </Form>
    </AuthPageFrame>
  );
});

export default ResetPasswordView;
