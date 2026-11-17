'use client';

import { useTranslations } from 'next-intl';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Dropdown, Input } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import type { CustomerStatus } from '../api/customers.types';
import { CUSTOMER_STATUSES } from '../constants/customers.constants';
import { parseCustomerStatus } from '../utils/customer-url.utils';

interface CustomerFiltersProps {
  search: string;
  status?: CustomerStatus;
  onSearchChange: (search: string) => void;
  onStatusChange: (status?: CustomerStatus) => void;
}

const ALL_STATUSES = 'all';

/**
 * CustomerFilters — ô tìm kiếm + lọc trạng thái của danh sách khách hàng; giá trị sống trên URL (`useCustomerList`).
 *
 * Ô tìm kiếm không kiểm soát (`useImeSafeSearchInput`) nên gõ Telex / VNI không mất dấu.
 *
 * @param props.search - Từ khoá hiện tại trên URL.
 * @param props.status - Trạng thái đang lọc; `undefined` = mọi trạng thái.
 * @param props.onSearchChange - Gọi mỗi khi từ khoá đổi (đã qua kiểm IME).
 * @param props.onStatusChange - Gọi khi chọn trạng thái; `undefined` = bỏ lọc.
 */
export default function CustomerFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CustomerFiltersProps) {
  const t = useTranslations('customers');
  const { inputProps } = useImeSafeSearchInput(search, onSearchChange);

  const options = [
    { value: ALL_STATUSES, label: t('list.statusAll') },
    ...CUSTOMER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
  ];

  return (
    <>
      <Input
        {...inputProps}
        aria-label={t('list.searchAria')}
        clearable
        placeholder={t('list.searchPlaceholder')}
        size="sm"
        startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
        wrapperClassName="max-w-sm"
      />
      <Dropdown
        options={options}
        size="sm"
        value={status ?? ALL_STATUSES}
        onValueChange={(value) => onStatusChange(parseCustomerStatus(value))}
      />
    </>
  );
}
