import { cn } from '@/shared/utils/style/cn';

import type { TimesheetCode } from '../../constants/timesheet.constants';

/**
 * Bảng class màn "Chấm công" — lưới trang, ô ký hiệu công (màu theo loại), header ngày, cột nhân viên / tổng hợp.
 *
 * Sửa:    lưới + panel → TIMESHEET_LAYOUT_CLASSES · màu ký hiệu → TIMESHEET_CODE_CLASSES (chú giải dùng chung) · ô ngày →
 *         TIMESHEET_CELL_CLASSES · header ngày → TIMESHEET_HEAD_CLASSES · cột → TIMESHEET_COLUMN_CLASSES
 * Lưu ý:  "X" (đi làm) cố ý KHÔNG nền — ô thường gặp nhất phải yên để P / KP / T / ½ / L nổi lên; Chủ nhật tô nền cả cột.
 *         Nền cột (Chủ nhật · hôm nay · tổng) phải ĐẶC — cùng class phủ cả ô dòng tổng dính đáy, nền trong suốt lộ chữ bên dưới.
 *         Màu nền viên nhạt theo đúng công thức `Badge tinted` (sáng 12–16% · tối 24–28% + chữ bậc 3).
 */

type TimesheetLayoutSlot = 'kpis' | 'panel' | 'title' | 'note';

type TimesheetCellSlot = 'root' | 'chip' | 'late' | 'pending';

type TimesheetHeadSlot = 'root' | 'day' | 'weekday' | 'sunday' | 'today' | 'label';

type TimesheetColumnSlot =
  | 'day'
  | 'sunday'
  | 'today'
  | 'total'
  | 'totalHead'
  | 'totalFirst'
  | 'totalMain'
  | 'totalValue'
  | 'totalZero'
  | 'totalAlert'
  | 'presence'
  | 'footLabel';

export type TimesheetTotalKey = 'workdays' | 'leave' | 'otHours' | 'lateCount';

type TimesheetEmployeeSlot = 'root' | 'name' | 'meta';

type TimesheetLegendSlot = 'root' | 'header' | 'strip' | 'item' | 'swatch' | 'sunday' | 'lateDot';

export const TIMESHEET_LAYOUT_CLASSES = {
  kpis: 'grid shrink-0 grid-cols-2 gap-2 max-[24rem]:grid-cols-1 lg:grid-cols-4',
  panel: 'squircle min-h-96 flex-1',
  title: 'm-0 truncate text-body-14-semibold text-fg-heading',
  note: 'text-body-14 text-fg-muted',
} satisfies Record<TimesheetLayoutSlot, string>;

export const TIMESHEET_CODE_CLASSES = {
  X: 'text-fg-subheading',
  T: 'bg-primary-5/14 text-primary-7 dark:bg-primary-5/26 dark:text-primary-3',
  H: 'bg-indigo-5/12 text-indigo-7 dark:bg-indigo-5/26 dark:text-indigo-3',
  P: 'bg-info-5/12 text-info-7 dark:bg-info-5/28 dark:text-blue-3',
  KP: 'bg-error-5/14 text-error-7 dark:bg-error-5/28 dark:text-red-3',
  L: 'bg-accent-5/16 text-accent-8 dark:bg-accent-5/24 dark:text-yellow-3',
  CN: '',
} satisfies Record<TimesheetCode, string>;

export const TIMESHEET_CELL_CLASSES = {
  root: 'flex h-full items-center justify-center',
  chip: cn(
    'relative flex h-6 min-w-6 items-center justify-center rounded-sm px-0.5',
    'text-caption-12-semibold tabular-nums',
  ),
  late: 'absolute -top-0.5 -right-0.5 size-2 rounded-full bg-warning-5 ring-2 ring-bg-surface',
  pending: 'text-caption-12 text-fg-faint',
} satisfies Record<TimesheetCellSlot, string>;

export const TIMESHEET_HEAD_CLASSES = {
  root: 'flex flex-col items-center leading-tight',
  day: 'flex size-5 items-center justify-center rounded-full text-caption-12-semibold tabular-nums',
  weekday: 'text-caption-10 text-fg-muted',
  sunday: 'text-error-7 dark:text-red-3',
  today: 'bg-primary-6 text-neutral-0',
  label: 'text-caption-12-semibold text-fg-subheading',
} satisfies Record<TimesheetHeadSlot, string>;

export const TIMESHEET_COLUMN_CLASSES = {
  day: 'px-0',
  sunday: 'bg-bg-subtle',
  today: 'bg-[color-mix(in_srgb,var(--color-primary-5)_8%,var(--color-bg-surface))]',
  total: 'px-2 bg-[color-mix(in_srgb,var(--color-primary-5)_4%,var(--color-bg-surface))]',
  totalHead: 'px-2',
  totalFirst: 'shadow-[inset_1px_0_0_var(--color-border-strong)]',
  totalMain: 'text-body-13-semibold tabular-nums text-fg-heading',
  totalValue: 'text-body-13 tabular-nums text-fg-body',
  totalZero: 'text-body-13 text-fg-faint',
  totalAlert: 'text-body-13-semibold tabular-nums text-warning-7 dark:text-orange-3',
  presence: 'text-caption-12-medium tabular-nums text-fg-subheading',
  footLabel: 'text-caption-12-semibold text-fg-subheading',
} satisfies Record<TimesheetColumnSlot, string>;

/**
 * Ghim phải bốn cột tổng từ `lg` (điện thoại thì cuộn theo — ghim cả hai mép sẽ hết chỗ cho ngày). Mép phải = tổng bề
 * rộng các cột sau nó (64 · 64 · 56 px) — đổi bề rộng cột tổng ở `TimesheetGrid` thì sửa ở đây. Ô thân / dòng tổng
 * `z-[2]` (dòng tổng đứng sau trong DOM nên nằm trên), ô header `z-20` như cột ghim trái của kit.
 */
export const TIMESHEET_TOTAL_PIN_CLASSES = {
  workdays: 'lg:sticky lg:right-46 lg:z-[2]',
  leave: 'lg:sticky lg:right-32 lg:z-[2]',
  otHours: 'lg:sticky lg:right-16 lg:z-[2]',
  lateCount: 'lg:sticky lg:right-0 lg:z-[2]',
} satisfies Record<TimesheetTotalKey, string>;

export const TIMESHEET_TOTAL_HEAD_PIN_CLASSES = {
  workdays: 'lg:right-46 lg:z-20',
  leave: 'lg:right-32 lg:z-20',
  otHours: 'lg:right-16 lg:z-20',
  lateCount: 'lg:right-0 lg:z-20',
} satisfies Record<TimesheetTotalKey, string>;

export const TIMESHEET_EMPLOYEE_CLASSES = {
  root: 'flex min-w-0 flex-col leading-tight',
  name: 'truncate text-body-13-medium text-fg-heading',
  meta: 'truncate text-caption-12 text-fg-muted',
} satisfies Record<TimesheetEmployeeSlot, string>;

export const TIMESHEET_LEGEND_CLASSES = {
  root: 'flex items-center gap-3 whitespace-nowrap text-caption-12 text-fg-body',
  header: 'phone:hidden',
  strip: 'hidden shrink-0 overflow-x-auto border-b border-border-default px-2 py-1.5 phone:flex',
  item: 'flex items-center gap-1.5',
  swatch: 'flex h-5 min-w-5 items-center justify-center rounded-sm px-0.5 text-caption-10-bold',
  sunday: 'size-4 rounded-xs bg-bg-subtle ring-1 ring-border-default',
  lateDot: 'size-2 rounded-full bg-warning-5',
} satisfies Record<TimesheetLegendSlot, string>;
