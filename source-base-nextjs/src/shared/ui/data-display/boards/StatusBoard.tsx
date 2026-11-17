import { memo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

export type StatusBoardState = 'running' | 'idle' | 'warning' | 'stopped';
export type StatusBoardTone = 'sky' | 'primary' | 'teal';

export interface StatusBoardItem {
  /** Khoá ổn định (làm key). */
  id: string;
  label: string;
  icon?: SystemIconName;
  state: StatusBoardState;
  /** Nhãn trạng thái thay câu mặc định của `state` (vd "Bảo trì định kỳ"). */
  stateLabel?: string;
  /** Mức 0–100 của thanh (công suất, hiệu suất…); ngoài khoảng bị kẹp. */
  value: number;
}

export interface StatusBoardProps {
  items: readonly StatusBoardItem[];
  tone?: StatusBoardTone;
  valueFormat?: (value: number) => string;
  className?: string;
}

type StatusBoardSlot =
  'list' | 'row' | 'icon' | 'label' | 'state' | 'stateText' | 'dot' | 'track' | 'fill' | 'value';

const STATUS_BOARD_CLASSES = {
  list: 'm-0 flex list-none flex-col p-0',
  row: cn(
    'grid min-w-0 items-center gap-x-3 py-2',
    'grid-cols-[1.25rem_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(2.5rem,1fr)_2.75rem]',
    'border-b border-divider-default last:border-b-0',
  ),
  icon: 'flex items-center justify-center text-fg-muted [&>svg]:size-4.5!',
  label: cn(TEXT_ELLIPSIS_CLASSES, 'text-body-13 text-fg-heading'),
  state: 'flex min-w-0 items-center gap-1.5 text-caption-12-medium',
  stateText: cn(TEXT_ELLIPSIS_CLASSES, 'min-w-0'),
  dot: 'size-1.5 shrink-0 rounded-full bg-current',
  track: 'relative h-1.5 w-full overflow-hidden rounded-lg bg-bg-track',
  fill: 'absolute inset-y-0 left-0 rounded-lg transition-[width] duration-700 ease-out motion-reduce:transition-none',
  value: 'text-right text-caption-12-semibold tabular-nums text-fg-heading',
} satisfies Record<StatusBoardSlot, string>;

/** Màu chữ + chấm của trạng thái: bậc đậm ở sáng, bậc sáng ở tối. */
const STATUS_BOARD_STATE_CLASSES = {
  running: 'text-success-8 dark:text-green-3',
  idle: 'text-info-7 dark:text-blue-3',
  warning: 'text-warning-7 dark:text-orange-3',
  stopped: 'text-error-7 dark:text-red-3',
} satisfies Record<StatusBoardState, string>;

/** Thanh mức: dốc sáng dần về đầu thanh, cùng bậc ở hai theme. */
const STATUS_BOARD_FILL_CLASSES = {
  sky: 'bg-linear-to-r from-sky-7 to-sky-5',
  primary: 'bg-linear-to-r from-primary-7 to-primary-5',
  teal: 'bg-linear-to-r from-teal-7 to-teal-5',
} satisfies Record<StatusBoardTone, string>;

/**
 * StatusBoard — bảng trạng thái thiết bị / dây chuyền: icon, tên, chấm + câu trạng thái, thanh mức và con số %.
 *
 * Mỗi hàng là MỘT máy; thanh đo theo 0–100 (công suất, tải, hiệu suất) — so giá trị tự do giữa các mục thì dùng
 * `RankingBoard` / `CapsuleChart`. Các cột thẳng hàng giữa mọi hàng (lưới cột cố định tỉ lệ), tên dài cắt "…".
 * Sửa giao diện: `STATUS_BOARD_CLASSES` · màu trạng thái → `STATUS_BOARD_STATE_CLASSES` (câu mặc định
 * theo ngôn ngữ ở `ui.dataDisplay` → `statusBoard.states`) · thanh → `STATUS_BOARD_FILL_CLASSES`.
 * Lưu ý: màu trạng thái không đổi theo `tone` (tone chỉ tô thanh).
 *
 * @param props.items - Các máy `{ id, label, icon?, state, stateLabel?, value }`; `state` ∈ `running` | `idle` |
 *   `warning` | `stopped`.
 * @param props.tone - Màu thanh mức: `sky` | `primary` | `teal`. Mặc định `sky`.
 * @param props.valueFormat - `(value) => string` cho con số cuối hàng. Mặc định `formatPercent(value, 0, locale)` ("85%").
 * @param props.className - Class thêm cho `<ul>`.
 *
 * @example
 * <StatusBoard
 *   items={[{ id: 'cut-01', label: 'Máy cắt thép 01', icon: 'gear-outline', state: 'running', value: 85 }]}
 * />
 */
const StatusBoard = memo(function StatusBoard({
  items,
  tone = 'sky',
  valueFormat,
  className,
}: StatusBoardProps) {
  const t = useTranslations('ui.dataDisplay');
  const locale = useLocale();
  const formatValue = valueFormat ?? ((n: number) => formatPercent(n, 0, locale));

  return (
    <ul className={cn(STATUS_BOARD_CLASSES.list, className)}>
      {items.map((item) => {
        const pct = Math.max(0, Math.min(100, Number.isFinite(item.value) ? item.value : 0));
        const stateLabel = item.stateLabel ?? t(`statusBoard.states.${item.state}`);

        return (
          <li key={item.id} className={STATUS_BOARD_CLASSES.row}>
            <span aria-hidden className={STATUS_BOARD_CLASSES.icon}>
              {item.icon && <SystemIcon name={item.icon} />}
            </span>
            <span className={STATUS_BOARD_CLASSES.label} title={item.label}>
              {item.label}
            </span>
            <span
              className={cn(STATUS_BOARD_CLASSES.state, STATUS_BOARD_STATE_CLASSES[item.state])}
              title={stateLabel}
            >
              <span aria-hidden className={STATUS_BOARD_CLASSES.dot} />
              <span className={STATUS_BOARD_CLASSES.stateText}>{stateLabel}</span>
            </span>
            <span
              aria-label={`${item.label}: ${formatValue(pct)}`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={pct}
              className={STATUS_BOARD_CLASSES.track}
              role="meter"
            >
              <span
                className={cn(STATUS_BOARD_CLASSES.fill, STATUS_BOARD_FILL_CLASSES[tone])}
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className={STATUS_BOARD_CLASSES.value}>{formatValue(pct)}</span>
          </li>
        );
      })}
    </ul>
  );
});

export default StatusBoard;
