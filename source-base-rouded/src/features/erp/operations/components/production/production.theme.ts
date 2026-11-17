import type { BadgeColor } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import type { OrderStatus } from '../../utils/production.utils';

/**
 * Bảng class màn "Tiến độ sản xuất" — lưới trang, tiêu đề panel, thanh tiến độ kế hoạch ↔ thực tế và dải Gantt.
 *
 * Sửa:    lưới → PRODUCTION_LAYOUT_CLASSES · màu trạng thái lệnh → ORDER_STATUS_META · thanh tiến độ trong bảng →
 *         ORDER_PROGRESS_CLASSES · dải Gantt (ô + header) → GANTT_CLASSES
 * Lưu ý:  màu trạng thái theo nghĩa cố định của `CHART_STATUS`: đúng tiến độ lam · chậm cam · hoàn thành xanh — badge,
 *         thanh tiến độ và thanh thực tế trên Gantt dùng CÙNG một màu cho một trạng thái.
 */

type ProductionLayoutSlot =
  'kpis' | 'bottom' | 'orders' | 'chart' | 'workshops' | 'title' | 'note' | 'hint';

type OrderProgressSlot =
  'root' | 'bar' | 'track' | 'fill' | 'marker' | 'numbers' | 'value' | 'plan';

type GanttSlot =
  | 'root'
  | 'sunday'
  | 'week'
  | 'plan'
  | 'actual'
  | 'today'
  | 'clipStart'
  | 'clipEnd'
  | 'headRoot'
  | 'headWeek'
  | 'headToday';

export const PRODUCTION_LAYOUT_CLASSES = {
  kpis: 'grid shrink-0 grid-cols-2 gap-2 max-[24rem]:grid-cols-1 lg:grid-cols-4',
  bottom: 'grid shrink-0 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]',
  orders: 'squircle min-h-56 flex-1 phone:min-h-96',
  chart: 'squircle h-52',
  workshops: 'squircle h-52',
  title: 'm-0 truncate text-body-14-semibold text-fg-heading',
  note: 'text-body-14 text-fg-muted',
  hint: 'whitespace-nowrap text-caption-12 text-fg-muted',
} satisfies Record<ProductionLayoutSlot, string>;

type OrderCellSlot = 'code' | 'twoLine' | 'main' | 'sub' | 'body' | 'dates' | 'actual' | 'planned';

/** Chữ trong các ô của bảng lệnh — dòng chính 13px, dòng phụ 12px mờ. */
export const ORDER_CELL_CLASSES = {
  code: 'whitespace-nowrap text-body-13-medium text-fg-heading',
  twoLine: 'flex min-w-0 flex-col leading-tight',
  main: 'truncate text-body-13-medium text-fg-heading',
  sub: 'truncate text-caption-12 text-fg-muted',
  body: 'truncate text-body-13 text-fg-body',
  dates: 'whitespace-nowrap text-body-13 tabular-nums text-fg-heading',
  actual: 'text-body-13-semibold tabular-nums text-fg-heading',
  planned: 'text-caption-12 tabular-nums text-fg-muted',
} satisfies Record<OrderCellSlot, string>;

export interface OrderStatusMeta {
  label: string;
  badge: BadgeColor;
  fill: string;
}

export const ORDER_STATUS_META = {
  onTrack: { label: 'Đúng tiến độ', badge: 'info', fill: 'bg-info-5' },
  late: { label: 'Chậm', badge: 'warning', fill: 'bg-warning-5' },
  done: { label: 'Hoàn thành', badge: 'success', fill: 'bg-success-6' },
} satisfies Record<OrderStatus, OrderStatusMeta>;

export const ORDER_PROGRESS_CLASSES = {
  root: 'flex min-w-0 items-center gap-2',
  bar: 'relative min-w-0 flex-1',
  track: 'h-1.5 overflow-hidden rounded-full bg-bg-track',
  fill: 'h-full rounded-full',
  marker:
    'absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg-heading',
  numbers: 'flex w-14 shrink-0 flex-col items-end leading-tight',
  value: 'text-body-13-semibold tabular-nums text-fg-heading',
  plan: 'text-caption-10 tabular-nums text-fg-muted',
} satisfies Record<OrderProgressSlot, string>;

export const GANTT_CLASSES = {
  root: 'relative h-11 w-full',
  sunday: 'absolute inset-y-0 bg-bg-subtle',
  week: 'absolute inset-y-0 w-px bg-divider-default',
  plan: cn(
    'absolute top-3 h-2.5 rounded-full',
    'bg-bg-pressed ring-1 ring-border-strong ring-inset',
  ),
  actual: 'absolute top-6 h-1.5 rounded-full',
  today: 'absolute inset-y-0 w-0.5 -translate-x-1/2 bg-primary-6',
  clipStart: 'rounded-l-none',
  clipEnd: 'rounded-r-none',
  headRoot: 'relative h-5 w-full',
  headWeek: cn(
    'absolute inset-y-0 flex items-center justify-center truncate border-l border-divider-default',
    'text-caption-12-medium tabular-nums text-fg-subheading first:border-l-0',
  ),
  headToday: 'absolute -bottom-2.5 h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-primary-6',
} satisfies Record<GanttSlot, string>;

type WorkshopRowSlot =
  | 'list'
  | 'row'
  | 'selected'
  | 'dimmed'
  | 'head'
  | 'name'
  | 'counts'
  | 'oee'
  | 'oeeBelow'
  | 'oeeUnit'
  | 'parts'
  | 'part'
  | 'partLabel';

/** Dòng của panel "Hiệu suất theo xưởng" — dòng đang lọc nhuộm nhạt, dòng khác mờ đi; OEE dưới mục tiêu chữ cam. */
export const WORKSHOP_ROW_CLASSES = {
  list: 'flex h-full flex-col divide-y divide-divider-default',
  row: 'flex min-h-0 flex-1 flex-col justify-center gap-1 px-3 py-1.5 transition-opacity duration-150',
  selected: 'bg-primary-5/6',
  dimmed: 'opacity-55',
  head: 'flex min-w-0 items-baseline gap-2',
  name: 'shrink-0 text-body-13-semibold text-fg-heading',
  counts: 'min-w-0 flex-1 truncate text-caption-12 text-fg-muted',
  oee: 'shrink-0 text-body-16-semibold tabular-nums text-fg-heading',
  oeeBelow: 'text-warning-7 dark:text-orange-3',
  oeeUnit: 'text-caption-10 text-fg-muted',
  parts: 'grid grid-cols-3 gap-3',
  part: 'flex min-w-0 flex-col gap-0.5',
  partLabel: 'flex justify-between gap-1 text-caption-10 tabular-nums text-fg-muted',
} satisfies Record<WorkshopRowSlot, string>;

type GanttLegendSlot = 'root' | 'item' | 'plan' | 'actual' | 'today';

/** Ô chú giải dải Gantt ở header panel lệnh (kế hoạch · thực tế · hôm nay). */
export const GANTT_LEGEND_CLASSES = {
  root: 'flex items-center gap-3 whitespace-nowrap text-caption-12 text-fg-muted phone:hidden',
  item: 'flex items-center gap-1.5',
  plan: 'h-2.5 w-5 rounded-full bg-bg-pressed ring-1 ring-border-strong ring-inset',
  actual: 'h-1.5 w-5 rounded-full bg-info-5',
  today: 'h-3.5 w-0.5 rounded-full bg-primary-6',
} satisfies Record<GanttLegendSlot, string>;
