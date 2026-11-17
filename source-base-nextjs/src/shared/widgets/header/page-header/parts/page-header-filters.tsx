'use client';

import { Fragment, memo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { PAGE_HEADER_FILTER_CLASSES } from '../page-header.theme';
import type { PageHeaderFilter } from '../page-header.types';
import PageHeaderFilterOptions from './page-header-filter-options';

interface PageHeaderFiltersProps {
  filters: readonly PageHeaderFilter[];
  label?: string;
  className?: string;
}

/**
 * PageHeaderFilters — nút PHỄU trên top bar ĐIỆN THOẠI (máy tính dùng cột dọc `PageHeaderFilterRail`): bấm mở bảng xổ
 * xuống xếp DỌC mọi bộ lọc (tên + điều khiển); số trên nút = bộ lọc đang khác mặc định. Phần nội bộ của `PageHeader`.
 *
 * @param props.filters - Bộ lọc của trang (`PageHeaderFilter[]`).
 * @param props.label - Nhãn nút + tiêu đề bảng. Mặc định theo ngôn ngữ ("Bộ lọc").
 * @param props.className - Class thêm cho nút.
 *
 * @example
 * <PageHeaderFilters filters={filters} />
 */
const PageHeaderFilters = memo(function PageHeaderFilters({
  filters,
  label,
  className,
}: PageHeaderFiltersProps) {
  const t = useTranslations('ui.widgets');
  const [open, setOpen] = useState(false);
  const activeCount = filters.filter((filter) => filter.active).length;
  const text = label ?? t('pageHeader.filters');
  const spoken =
    activeCount > 0 ? t('pageHeader.filtersWithCount', { label: text, count: activeCount }) : text;

  return (
    <Popover
      align="end"
      className={PAGE_HEADER_FILTER_CLASSES.panel}
      content={
        <div className={PAGE_HEADER_FILTER_CLASSES.body}>
          {filters.map((filter) => (
            <Fragment key={filter.key}>
              <p className={PAGE_HEADER_FILTER_CLASSES.title}>{filter.label}</p>
              {filter.content ?? <PageHeaderFilterOptions filter={filter} />}
            </Fragment>
          ))}
        </div>
      }
      open={open}
      side="bottom"
      sideOffset={6}
      onOpenChange={setOpen}
    >
      <button
        aria-label={spoken}
        className={cn(PAGE_HEADER_FILTER_CLASSES.trigger, className)}
        title={spoken}
        type="button"
      >
        <SystemIcon name="filter-outline" size={16} />
        {activeCount > 0 && <span className={PAGE_HEADER_FILTER_CLASSES.badge}>{activeCount}</span>}
      </button>
    </Popover>
  );
});

export default PageHeaderFilters;
