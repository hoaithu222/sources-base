'use client';

import { useTranslations } from 'next-intl';

import { restoreSession } from '@/domains/session';
import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import StatusView from './StatusView';

/**
 * SessionUnavailableView — màn của `AuthGate` khi chưa hỏi được máy chủ về phiên (`unavailable`);
 * nút "Thử lại" khôi phục phiên lần nữa và giữ nguyên URL (không đá về trang đăng nhập).
 */
export default function SessionUnavailableView() {
  const t = useTranslations('errors.screens.sessionUnavailable');

  return (
    <StatusView description={t('description')} title={t('title')}>
      <Button
        size="md"
        startIcon={<SystemIcon name="arrows-rotate-bold" />}
        variant="primary"
        onClick={() => void restoreSession()}
      >
        {t('action')}
      </Button>
    </StatusView>
  );
}
