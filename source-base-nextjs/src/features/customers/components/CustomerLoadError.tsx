'use client';

import { useTranslations } from 'next-intl';

import { Button, EmptyState } from '@/shared/ui';

interface CustomerLoadErrorProps {
  description?: string;
  onRetry: () => void;
}

/**
 * CustomerLoadError — trạng thái lỗi tải dữ liệu của danh sách / trang sửa: câu lỗi + nút "Thử lại".
 *
 * Dùng khi query khai `silentError` (trang tự vẽ lỗi, bộ báo lỗi tập trung không toast).
 *
 * @param props.description - Câu mô tả, thường `errorMessageOf(error, …)`; bỏ trống thì chỉ có tiêu đề.
 * @param props.onRetry - Gọi khi bấm "Thử lại" (thường `query.refetch`).
 */
export default function CustomerLoadError({ description, onRetry }: CustomerLoadErrorProps) {
  const t = useTranslations('customers.state');

  return (
    <EmptyState
      action={
        <Button size="sm" variant="secondary" onClick={onRetry}>
          {t('retry')}
        </Button>
      }
      description={description}
      icon="triangle-exclamation-bold"
      iconColor="red"
      size="lg"
      title={t('loadFailed')}
    />
  );
}
