'use client';

import { useLayoutEffect } from 'react';
import { useTranslations } from 'next-intl';

import { showToast } from '@/shared/ui';

import { bootstrapApp } from '../bootstrap';
import { getQueryClient } from '../query-client';

/**
 * SessionBootstrap — nối HTTP với phiên (token adapter), dọn state theo tài khoản khi phiên kết thúc, đồng bộ đa tab.
 * Chạy trong `useLayoutEffect` để API đầu tiên của cây con (khôi phục phiên) đã có adapter — xem `bootstrap.ts`.
 */
export default function SessionBootstrap() {
  const t = useTranslations('common');

  useLayoutEffect(
    () =>
      bootstrapApp({
        queryClient: getQueryClient(),
        onSessionExpired: () => showToast('warning', t('sessionExpired')),
      }),
    [t],
  );

  return null;
}
