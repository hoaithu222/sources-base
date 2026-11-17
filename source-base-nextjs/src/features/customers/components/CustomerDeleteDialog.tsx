'use client';

import { useTranslations } from 'next-intl';

import { useLatestRequest } from '@/shared/hooks';
import { ConfirmDialog, showToast } from '@/shared/ui';

import type { Customer } from '../api/customers.types';
import { useDeleteCustomer } from '../service/customers.queries';

interface CustomerDeleteDialogProps {
  customer: Customer | null;
  onClose: () => void;
}

/**
 * CustomerDeleteDialog — hộp xác nhận xoá một khách hàng; mở khi `customer` khác `null`.
 *
 * Giữ hộp mở và khoá nút trong lúc xoá (`loading`), xong mới đóng + toast. Lỗi xoá do bộ báo lỗi tập trung toast
 * (`useDeleteCustomer` không khai `silentError`) nên hộp ở lại để thử lại. Danh sách tự làm mới nhờ invalidate trong hook.
 *
 * @param props.customer - Bản ghi sắp xoá; `null` = đóng.
 * @param props.onClose - Gọi khi người dùng huỷ hoặc xoá xong.
 */
export default function CustomerDeleteDialog({ customer, onClose }: CustomerDeleteDialogProps) {
  const t = useTranslations('customers.delete');
  const remove = useDeleteCustomer();
  const { begin } = useLatestRequest();

  const handleConfirm = async () => {
    if (!customer || remove.isPending) return;
    const isCurrent = begin();
    try {
      await remove.mutateAsync(customer.id);
    } catch {
      return;
    }
    showToast('success', t('success'));
    if (isCurrent()) onClose();
  };

  return (
    <ConfirmDialog
      actionLabel={t('confirm')}
      closeOnConfirm={false}
      description={t('description', { name: customer?.name ?? '' })}
      loading={remove.isPending}
      open={customer !== null}
      title={t('title')}
      variant="delete"
      onConfirm={() => void handleConfirm()}
      onOpenChange={(open) => {
        if (!open && !remove.isPending) onClose();
      }}
    />
  );
}
