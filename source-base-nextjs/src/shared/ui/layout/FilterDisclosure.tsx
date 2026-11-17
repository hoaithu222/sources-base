'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useIsPhone } from '@/shared/hooks';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

export interface FilterDisclosureProps {
  children: React.ReactNode;
  label?: string;
  summary?: React.ReactNode;
  activeCount?: number;
  onReset?: () => void;
  defaultOpen?: boolean;
  sticky?: boolean;
  className?: string;
  bodyClassName?: string;
}

const FILTER_DISCLOSURE_CLASSES = {
  root: 'overflow-hidden rounded-lg border border-border-default bg-bg-surface',
  rootSticky: 'sticky top-0 z-10 bg-bg-dialog',
  toggle: cn(
    'flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left outline-none',
    'transition-colors duration-150 motion-reduce:transition-none active:bg-bg-pressed',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus/70',
  ),
  icon: 'shrink-0 text-fg-muted',
  label: 'shrink-0 text-body-14-medium text-fg-heading',
  badge: cn(
    'flex h-4 min-w-4 shrink-0 items-center justify-center rounded-xs bg-primary-5 px-1',
    'text-caption-10-bold leading-none tabular-nums text-neutral-0',
  ),
  summary: cn(
    'min-w-0 flex-1 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap text-right',
    'text-caption-12 text-fg-muted',
  ),
  chevron: 'shrink-0 text-fg-muted transition-transform duration-200 motion-reduce:transition-none',
  chevronOpen: 'rotate-180',
  region: 'grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none',
  regionOpen: 'grid-rows-[1fr]',
  regionClosed: 'grid-rows-[0fr]',
  clip: 'min-h-0 overflow-hidden',
  panel: 'flex flex-col gap-2 border-t border-divider-default p-3',
  controls: 'grid grid-cols-1 gap-2',
  reset: cn(
    'flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3',
    'border border-border-default bg-bg-subtle text-body-14-medium text-fg-body',
    'outline-none transition-colors duration-150 motion-reduce:transition-none',
    'active:bg-bg-pressed disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-ring-focus/70',
  ),
};

/**
 * FilterDisclosure — gom NHIỀU bộ lọc trong modal / box thành MỘT thanh thu gọn ở ĐIỆN THOẠI; màn rộng vẽ
 * nguyên `children` tại chỗ. Một bộ lọc đơn lẻ thì để thẳng, không bọc.
 *
 * Điện thoại (`useIsPhone`): thanh cao 44px `[⚙ Bộ lọc ▫n  tóm tắt ▾]`, bấm bung TẠI CHỖ (không popover lồng)
 * kèm nút "Đặt lại". Từ 768px trở lên (không phải điện thoại xoay ngang): `display: contents`, không thêm hộp nào.
 * Sửa giao diện: `FILTER_DISCLOSURE_CLASSES`.
 * Lưu ý: phần bung chỉ ẩn bằng `grid-rows` + `inert`, KHÔNG gỡ khỏi cây — điều khiển bên trong giữ state. Lý do
 * thiết kế: notes/components/layout.md#filterdisclosure.
 *
 * @param props.children - Các điều khiển lọc; điện thoại xếp 1 cột, cách 8px (đổi bằng `bodyClassName`).
 * @param props.label - Tên vùng lọc: nhãn nút thu gọn + `aria-label` của vùng. Mặc định theo ngôn ngữ (khoá
 *   `ui.layout.filterDisclosure.label`: "Bộ lọc").
 * @param props.summary - Tóm tắt giá trị đang chọn, hiện MỘT dòng cạnh nhãn khi thu gọn.
 * @param props.activeCount - Số bộ lọc lệch khỏi mặc định → huy hiệu vuông cạnh nhãn; 0 / bỏ trống = không có.
 * @param props.onReset - Có → hiện nút "Đặt lại" (khoá `ui.layout.filterDisclosure.reset`) cuối vùng mở; khoá khi `activeCount` là 0.
 * @param props.defaultOpen - Mở sẵn lúc đầu (điện thoại). Mặc định `false`.
 * @param props.sticky - Dính đầu vùng cuộn khi thân cuộn dài (điện thoại). Mặc định `false`.
 * @param props.className - Class của lớp bọc ngoài (điện thoại; màn rộng bỏ qua).
 * @param props.bodyClassName - Class của vùng chứa điều khiển khi mở (điện thoại), vd `grid-cols-2`.
 *
 * @example
 * <FilterDisclosure activeCount={2} summary="T11/2025 → T10/2026" onReset={resetFilters}>
 *   <MonthRangeFilter value={range} onChange={setRange} />
 *   <SegmentToggle options={viewOptions} value={view} onValueChange={setView} />
 * </FilterDisclosure>
 */
function FilterDisclosure({
  children,
  label,
  summary,
  activeCount,
  onReset,
  defaultOpen = false,
  sticky = false,
  className,
  bodyClassName,
}: FilterDisclosureProps) {
  const t = useTranslations('ui.layout');
  const phone = useIsPhone();
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();

  if (!phone) return <div className="contents">{children}</div>;

  const resolvedLabel = label ?? t('filterDisclosure.label');
  const active = activeCount ?? 0;
  const canReset = Boolean(onReset) && (activeCount === undefined || active > 0);

  return (
    <section
      aria-label={resolvedLabel}
      className={cn(
        FILTER_DISCLOSURE_CLASSES.root,
        sticky && FILTER_DISCLOSURE_CLASSES.rootSticky,
        className,
      )}
    >
      <button
        aria-controls={regionId}
        aria-expanded={open}
        className={FILTER_DISCLOSURE_CLASSES.toggle}
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <SystemIcon aria-hidden className={FILTER_DISCLOSURE_CLASSES.icon} name="sliders-outline" />
        <span className={FILTER_DISCLOSURE_CLASSES.label}>{resolvedLabel}</span>
        {active > 0 ? <span className={FILTER_DISCLOSURE_CLASSES.badge}>{active}</span> : null}
        <span className={FILTER_DISCLOSURE_CLASSES.summary}>{open ? null : summary}</span>
        <SystemIcon
          aria-hidden
          className={cn(
            FILTER_DISCLOSURE_CLASSES.chevron,
            open && FILTER_DISCLOSURE_CLASSES.chevronOpen,
          )}
          name="angle-down-outline"
        />
      </button>

      <div
        className={cn(
          FILTER_DISCLOSURE_CLASSES.region,
          open ? FILTER_DISCLOSURE_CLASSES.regionOpen : FILTER_DISCLOSURE_CLASSES.regionClosed,
        )}
      >
        <div className={FILTER_DISCLOSURE_CLASSES.clip} id={regionId} inert={!open}>
          <div className={FILTER_DISCLOSURE_CLASSES.panel}>
            <div className={cn(FILTER_DISCLOSURE_CLASSES.controls, bodyClassName)}>{children}</div>
            {onReset ? (
              <button
                className={FILTER_DISCLOSURE_CLASSES.reset}
                disabled={!canReset}
                type="button"
                onClick={onReset}
              >
                <SystemIcon aria-hidden name="arrow-rotate-left-outline" />
                {t('filterDisclosure.reset')}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FilterDisclosure;
