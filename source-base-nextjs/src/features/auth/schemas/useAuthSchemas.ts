'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { createAuthSchemas, PASSWORD_MIN_LENGTH } from './auth.schema';

/**
 * useAuthSchemas — bốn schema xác thực với thông báo ĐÃ DỊCH theo ngôn ngữ hiện tại (`messages/<locale>/auth.json` →
 * `validation`). Tạo lại khi đổi ngôn ngữ.
 *
 * Dùng:   const { loginSchema } = useAuthSchemas();   const form = useZodForm<LoginFormValues>(loginSchema, …);
 */
export function useAuthSchemas() {
  const t = useTranslations('auth.validation');

  return useMemo(
    () =>
      createAuthSchemas({
        emailRequired: t('emailRequired'),
        emailInvalid: t('emailInvalid'),
        passwordMin: t('passwordMin', { min: PASSWORD_MIN_LENGTH }),
        confirmRequired: t('confirmRequired'),
        mismatch: t('mismatch'),
        nameRequired: t('nameRequired'),
        tokenInvalid: t('tokenInvalid'),
      }),
    [t],
  );
}
