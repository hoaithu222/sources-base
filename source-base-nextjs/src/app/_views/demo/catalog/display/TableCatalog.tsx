'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Badge, SegmentToggle, Table } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatCurrency, formatDate } from '@/shared/utils/format/format.utils';

import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import {
  TABLE_PAGE_SIZES,
  TABLE_SAMPLE_ROWS,
  TABLE_VIEW_IDS,
} from '../data/catalog-sample.constants';
import type { CatalogRow } from '../data/catalog.types';

/**
 * TableCatalog — mục "Bảng dữ liệu" của catalog `/demo`: `Table` với dữ liệu mẫu có phân trang (cắt trang phía client), đổi
 * qua lại ba trạng thái — có dữ liệu · đang tải · rỗng. Bảng cuộn ngang trong khung khi màn hẹp (`minWidth`).
 */
export default function TableCatalog() {
  const t = useTranslations('demo.table');
  const locale = useLocale();
  const [view, setView] = useState<(typeof TABLE_VIEW_IDS)[number]>('data');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(TABLE_PAGE_SIZES[0]);

  const hasData = view === 'data';
  const rows = hasData ? TABLE_SAMPLE_ROWS.slice((page - 1) * pageSize, page * pageSize) : [];
  const viewOptions = TABLE_VIEW_IDS.map((key) => ({ key, label: t(`views.${key}`) }));

  const columns: TableColumn<CatalogRow>[] = [
    { key: 'code', header: t('columns.code'), width: 100, cell: (row) => row.code },
    { key: 'name', header: t('columns.name'), cell: (row) => row.name },
    {
      key: 'amount',
      header: t('columns.amount'),
      align: 'right',
      width: 160,
      cell: (row) => formatCurrency(row.amount, 'VND', locale),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: 140,
      cell: (row) => (
        <Badge color={row.status === 'active' ? 'success' : 'neutral'} shape="tag" size="sm">
          {t(`status.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: t('columns.date'),
      width: 120,
      cell: (row) => formatDate(row.date, undefined, locale),
    },
  ];

  return (
    <CatalogSection id="table">
      <CatalogState label={t('view')}>
        <SegmentToggle
          options={viewOptions}
          size="sm"
          value={view}
          onValueChange={(next) => setView(TABLE_VIEW_IDS.find((id) => id === next) ?? 'data')}
        />
      </CatalogState>
      <Table
        columns={columns}
        currentPage={page}
        data={rows}
        loading={view === 'loading'}
        minWidth={640}
        pageSize={pageSize}
        pageSizeOptions={TABLE_PAGE_SIZES}
        rowKey={(row) => row.id}
        total={hasData ? TABLE_SAMPLE_ROWS.length : 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </CatalogSection>
  );
}
