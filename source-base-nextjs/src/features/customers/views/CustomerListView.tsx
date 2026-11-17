'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { errorMessageOf } from '@/core/http';
import { Link } from '@/core/i18n';
import { usePermission } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button, EmptyState, PageBody, PageShell, Toolbar } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import type { Customer } from '../api/customers.types';
import CustomerDeleteDialog from '../components/CustomerDeleteDialog';
import CustomerFilters from '../components/CustomerFilters';
import CustomerLoadError from '../components/CustomerLoadError';
import CustomerTable from '../components/CustomerTable';
import { useCustomerList } from '../hooks/useCustomerList';

/**
 * CustomerListView — danh sách khách hàng (`/demo/customers`): tìm kiếm + lọc trạng thái + phân trang đều trên URL, bảng với
 * trạng thái đang tải / rỗng / không khớp bộ lọc / lỗi (có "Thử lại"), xoá có hộp xác nhận.
 *
 * Nút "Thêm khách hàng" và nút xoá chỉ hiện khi có quyền `customer:create` / `customer:delete` (chỉ giao diện — BE vẫn kiểm quyền).
 * Đọc `useSearchParams` nên `page.tsx` PHẢI bọc `<Suspense>`.
 */
export default function CustomerListView() {
  const t = useTranslations('customers.list');
  const list = useCustomerList();
  const canCreate = usePermission({ resource: 'customer', action: 'create' });
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const { query } = list;

  const createButton = canCreate && (
    <Button asChild size="sm">
      <Link href={PATHS.DEMO_CUSTOMER_NEW}>{t('create')}</Link>
    </Button>
  );

  const empty = list.hasFilter ? (
    <EmptyState
      action={
        <Button size="sm" variant="secondary" onClick={list.clearFilters}>
          {t('clearFilters')}
        </Button>
      }
      description={t('noMatchDescription')}
      icon="magnifying-glass-bold"
      iconColor="neutral"
      title={t('noMatchTitle')}
    />
  ) : (
    <EmptyState
      action={createButton}
      description={t('emptyDescription')}
      icon="users-bold"
      iconColor="primary"
      title={t('emptyTitle')}
    />
  );

  return (
    <PageShell>
      <PageHeader subtitle={t('subtitle')} title={t('title')} tone="sky" />
      <Toolbar
        left={
          <CustomerFilters
            search={list.search}
            status={list.status}
            onSearchChange={list.setSearch}
            onStatusChange={list.setStatus}
          />
        }
        right={createButton}
      />
      <PageBody overflow="hidden">
        {query.isError ? (
          <CustomerLoadError
            description={errorMessageOf(query.error)}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <CustomerTable
            empty={empty}
            loading={query.isPending}
            page={list.page}
            pageSize={list.pageSize}
            rows={query.data?.items ?? []}
            total={query.data?.total ?? 0}
            onDelete={setDeleting}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </PageBody>
      <CustomerDeleteDialog customer={deleting} onClose={() => setDeleting(null)} />
    </PageShell>
  );
}
