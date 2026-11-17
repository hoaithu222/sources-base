'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { Popover, Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { PAGE_HEADER_FILTER_CLASSES } from '../page-header.theme';
import type { PageHeaderFilter } from '../page-header.types';
import PageHeaderFilterOptions from './page-header-filter-options';

interface PageHeaderFilterRailProps {
  filters: readonly PageHeaderFilter[];
}

/** Biến trên `:root` = mép dưới của cột — Dock neo PHẢI canh giữa phần còn lại bên dưới, không chồng lên cột. */
const RAIL_BOTTOM_VAR = '--page-filter-rail-bottom';

function FilterRailItem({ filter }: { filter: PageHeaderFilter }) {
  const t = useTranslations('ui.widgets');
  const [open, setOpen] = useState(false);
  const hint = filter.value ? `${filter.label} · ${filter.value}` : filter.label;
  const close = () => setOpen(false);

  return (
    <Popover
      align="start"
      className={PAGE_HEADER_FILTER_CLASSES.panel}
      content={
        <div className={PAGE_HEADER_FILTER_CLASSES.body}>
          <p className={PAGE_HEADER_FILTER_CLASSES.title}>{filter.label}</p>
          {filter.content ?? <PageHeaderFilterOptions filter={filter} onPicked={close} />}
        </div>
      }
      open={open}
      side="left"
      sideOffset={10}
      onOpenChange={setOpen}
    >
      <span className="inline-flex">
        <Tooltip arrow={false} content={hint} disabled={open} side="left">
          <button
            aria-label={filter.active ? t('pageHeader.filterApplied', { label: hint }) : hint}
            className={PAGE_HEADER_FILTER_CLASSES.item}
            data-state={open ? 'open' : 'closed'}
            type="button"
          >
            <SystemIcon name={filter.icon} size={14} />
            {filter.active && <span aria-hidden className={PAGE_HEADER_FILTER_CLASSES.dot} />}
          </button>
        </Tooltip>
      </span>
    </Popover>
  );
}

/**
 * PageHeaderFilterRail — CỘT DỌC bộ lọc nổi sát mép PHẢI dưới header (máy tính): mỗi bộ lọc một icon 24px, chấm = đang
 * khác mặc định, rê đọc "tên · giá trị", bấm mở bảng nổi sang trái chứa điều khiển hoặc danh sách chọn dọc (chọn là đóng).
 * Đè lên nội dung như Dock, không chiếm bề ngang; portal ra `body` (tránh `backdrop-filter` của header bẫy `fixed`).
 *
 * @param props.filters - Bộ lọc của trang (`PageHeaderFilter[]`).
 *
 * @example
 * <PageHeaderFilterRail filters={[{ key: 'month', label: 'Kỳ', icon: 'calendar-outline', value: 'T10/2026', content: <Dropdown … /> }]} />
 */
const PageHeaderFilterRail = memo(function PageHeaderFilterRail({
  filters,
}: PageHeaderFilterRailProps) {
  const t = useTranslations('ui.widgets');
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === 'undefined') return undefined;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(RAIL_BOTTOM_VAR, `${rail.offsetTop + rail.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(rail);
    window.addEventListener('resize', publish);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', publish);
      root.style.removeProperty(RAIL_BOTTOM_VAR);
    };
  }, []);

  if (typeof document === 'undefined') return null;
  const activeCount = filters.filter((filter) => filter.active).length;

  return createPortal(
    <div
      ref={railRef}
      aria-label={
        activeCount > 0
          ? t('pageHeader.filtersWithCount', { label: t('pageHeader.filters'), count: activeCount })
          : t('pageHeader.filters')
      }
      aria-orientation="vertical"
      className={PAGE_HEADER_FILTER_CLASSES.rail}
      role="toolbar"
    >
      <span aria-hidden className={PAGE_HEADER_FILTER_CLASSES.railHead}>
        <SystemIcon name="filter-outline" size={12} />
      </span>
      <span aria-hidden className={PAGE_HEADER_FILTER_CLASSES.railDivider} />
      {filters.map((filter) => (
        <FilterRailItem key={filter.key} filter={filter} />
      ))}
    </div>,
    document.body,
  );
});

export default PageHeaderFilterRail;
