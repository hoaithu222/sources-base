'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { usePermission } from '@/domains/session';
import { formatCurrency, formatDate } from '@/shared/utils/format/format.utils';
import { Badge, Button, Table } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import type { Customer } from '../api/customers.types';
import { customerEditPath } from '../utils/customer-url.utils';

interface CustomerTableProps {
  rows: Customer[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  empty: ReactNode;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onDelete: (customer: Customer) => void;
}

const NAME_LINK_CLASSES = cn(
  'text-body-14-medium text-link underline-offset-2 hover:underline',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

/**
 * CustomerTable — bảng khách hàng của trang danh sách: tên là liên kết thật tới trang sửa, cột "Thao tác" (xoá) chỉ có khi
 * người dùng có quyền `customer:delete`.
 *
 * Phân trang phía server (`total` là tổng toàn bộ bản ghi). Quyền ở đây chỉ ẩn / hiện nút — BE vẫn phải kiểm quyền từng API.
 *
 * @param props.rows - Các dòng của trang hiện tại.
 * @param props.total - Tổng số khách hàng khớp bộ lọc (mọi trang).
 * @param props.page - Trang hiện tại, đếm từ 1.
 * @param props.pageSize - Số dòng mỗi trang.
 * @param props.loading - `true` khi đang tải lần đầu (bảng hiện spinner nếu chưa có dòng).
 * @param props.empty - Nội dung khi không có dòng nào (trạng thái rỗng / không khớp bộ lọc).
 * @param props.onPageChange - Gọi khi đổi trang.
 * @param props.onPageSizeChange - Gọi khi đổi cỡ trang.
 * @param props.onDelete - Gọi khi bấm "Xoá" ở một dòng (mở hộp xác nhận ở cha).
 */
export default function CustomerTable({
  rows,
  total,
  page,
  pageSize,
  loading,
  empty,
  onPageChange,
  onPageSizeChange,
  onDelete,
}: CustomerTableProps) {
  const t = useTranslations('customers');
  const locale = useLocale();
  const canDelete = usePermission({ resource: 'customer', action: 'delete' });

  const columns: TableColumn<Customer>[] = [
    { key: 'code', header: t('columns.code'), width: 100, cell: (row) => row.code },
    {
      key: 'name',
      header: t('columns.name'),
      cell: (row) => (
        <Link className={NAME_LINK_CLASSES} href={customerEditPath(row.id)}>
          {row.name}
        </Link>
      ),
    },
    { key: 'email', header: t('columns.email') },
    { key: 'phone', header: t('columns.phone'), width: 130, cell: (row) => row.phone || '—' },
    {
      key: 'creditLimit',
      header: t('columns.creditLimit'),
      align: 'right',
      width: 160,
      cell: (row) => formatCurrency(row.creditLimit, 'VND', locale),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: 150,
      cell: (row) => (
        <Badge color={row.status === 'active' ? 'success' : 'neutral'} shape="tag" size="sm">
          {t(`status.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: t('columns.updatedAt'),
      width: 120,
      cell: (row) => formatDate(row.updatedAt, undefined, locale),
    },
    ...(canDelete
      ? [
          {
            key: 'actions',
            header: t('columns.actions'),
            align: 'center' as const,
            width: 90,
            resizable: false,
            cell: (row: Customer) => (
              <Button
                aria-label={t('actions.deleteAria', { name: row.name })}
                iconOnly
                size="xs"
                skin="danger"
                variant="ghost"
                onClick={() => onDelete(row)}
              >
                <SystemIcon name="trash-outline" size={14} />
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      columns={columns}
      currentPage={page}
      data={rows}
      emptyMessage={empty}
      fill
      loading={loading}
      pageSize={pageSize}
      rowKey={(row) => row.id}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
