'use client';

import { memo } from 'react';

import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { PAGE_HEADER_FILTER_CLASSES as CLASSES } from '../page-header.theme';
import type { PageHeaderFilter } from '../page-header.types';

interface PageHeaderFilterOptionsProps {
  filter: PageHeaderFilter;
  onPicked?: () => void;
}

/**
 * PageHeaderFilterOptions — DANH SÁCH chọn dọc dựng sẵn của một bộ lọc (`PageHeaderFilter.options`): mỗi lựa chọn một dòng
 * (icon · tên + dòng phụ · số canh phải), dòng đang chọn nền đặc; bấm = `onSelect` rồi `onPicked` (cột dọc đóng bảng).
 * `role="radiogroup"` / `radio` + `aria-checked`. Phần nội bộ của `PageHeader` (cột lọc máy tính + bảng phễu điện thoại).
 *
 * @param props.filter - Bộ lọc có `options` (không có → `null`).
 * @param props.onPicked - Chạy sau khi chọn (đóng bảng nổi).
 *
 * @example
 * <PageHeaderFilterOptions filter={filter} onPicked={close} />
 */
const PageHeaderFilterOptions = memo(function PageHeaderFilterOptions({
  filter,
  onPicked,
}: PageHeaderFilterOptionsProps) {
  if (!filter.options?.length) return null;

  return (
    <div aria-label={filter.label} className={CLASSES.options} role="radiogroup">
      {filter.options.map((option) => {
        const selected = option.value === filter.selected;
        const pick = () => {
          filter.onSelect?.(option.value);
          onPicked?.();
        };
        return (
          <button
            key={option.value}
            aria-checked={selected}
            className={cn(CLASSES.option, selected && CLASSES.optionActive)}
            role="radio"
            type="button"
            onClick={pick}
          >
            {option.icon && <SystemIcon name={option.icon} size={14} />}
            <span className={CLASSES.optionText}>
              {option.label}
              {option.description && (
                <span className={cn(CLASSES.optionNote, selected && CLASSES.optionNoteActive)}>
                  {option.description}
                </span>
              )}
            </span>
            {option.meta && (
              <span className={cn(CLASSES.optionMeta, selected && CLASSES.optionNoteActive)}>
                {option.meta}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

export default PageHeaderFilterOptions;
