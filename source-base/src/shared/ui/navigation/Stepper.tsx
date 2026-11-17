import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { SystemIconName } from '@/shared/ui/icons/Icons';
import { HUD_TEXT_GLOW } from '@/shared/ui/primitives/hud.theme';

export type StepStatus = 'done' | 'active' | 'error' | 'pending';
export type StepperLayout = 'horizontal-center' | 'horizontal-inline' | 'vertical';
export type StepperSize = 'sm' | 'md';

export interface StepItem {
  key: string;
  label: string;
  /** Dòng phụ dưới tiêu đề (chữ caption, màu muted) — vd người xử lý, hạn, lý do lỗi. */
  description?: ReactNode;
  /** Trạng thái tường minh — thắng trạng thái suy ra từ `activeStep`. */
  status?: StepStatus;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep?: number;
  layout?: StepperLayout;
  size?: StepperSize;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const STEPPER_ROOT_LAYOUT_CLASSES = {
  'horizontal-center': 'flex items-start',
  'horizontal-inline': 'flex items-start gap-3',
  vertical: 'flex flex-col',
} satisfies Record<StepperLayout, string>;

const STEPPER_ITEM_LAYOUT_CLASSES = {
  'horizontal-center': 'relative flex min-w-0 flex-1 flex-col items-center gap-2 px-2 text-center',
  'horizontal-inline': 'flex min-w-0 flex-1 items-start gap-2 last:flex-none',
  vertical: 'relative flex gap-3',
} satisfies Record<StepperLayout, string>;

const STEPPER_CONTENT_LAYOUT_CLASSES = {
  'horizontal-center': 'flex max-w-full flex-col items-center gap-0.5',
  'horizontal-inline': 'flex flex-col gap-0.5',
  vertical: 'flex min-w-0 flex-1 flex-col gap-0.5 pb-6',
} satisfies Record<StepperLayout, string>;

const STEPPER_CONTENT_SIZE_CLASSES = {
  sm: 'pt-0',
  md: 'pt-0.5',
} satisfies Record<StepperSize, string>;

const STEPPER_TITLE_LAYOUT_CLASSES = {
  'horizontal-center': 'text-body-14-semibold break-words',
  'horizontal-inline': 'text-body-14-semibold whitespace-nowrap',
  vertical: 'text-body-14-semibold break-words',
} satisfies Record<StepperLayout, string>;

const STEPPER_TITLE_STATUS_CLASSES = {
  done: 'text-fg-heading',
  active: cn('text-fg-heading', HUD_TEXT_GLOW),
  error: 'text-error',
  pending: 'text-fg-muted',
} satisfies Record<StepStatus, string>;

const STEPPER_DESCRIPTION_LAYOUT_CLASSES = {
  'horizontal-center': 'text-caption-12 text-fg-muted break-words',
  'horizontal-inline': 'max-w-48 text-caption-12 text-fg-muted',
  vertical: 'text-caption-12 text-fg-muted break-words',
} satisfies Record<StepperLayout, string>;

const STEPPER_NODE_BASE_CLASSES = cn(
  'relative inline-flex shrink-0 items-center justify-center rounded-full border tabular-nums',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
);

const STEPPER_NODE_SIZE_CLASSES = {
  sm: 'size-5 text-caption-12-semibold',
  md: 'size-6 text-body-13-semibold',
} satisfies Record<StepperSize, string>;

/** Tối: `done` / `error` quầng tone trong + ngoài · `active` đặc dốc + gờ đỉnh + VÒNG sáng cách 3px · `pending` mặt rọi. */
const STEPPER_NODE_STATUS_CLASSES = {
  done: cn(
    'border-primary-5 bg-primary-5/12 text-action-base',
    'dark:border-primary-4 dark:bg-primary-5/18',
    'dark:shadow-[inset_0_0_6px_color-mix(in_srgb,var(--color-primary-4)_45%,transparent),0_0_10px_-1px_color-mix(in_srgb,var(--color-primary-5)_65%,transparent)]',
  ),
  active: cn(
    'border-primary-6 bg-primary-6 text-neutral-0',
    'dark:border-primary-4 dark:bg-linear-to-b dark:from-primary-5 dark:to-primary-7',
    'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_35%,transparent),0_0_0_3px_color-mix(in_srgb,var(--color-primary-5)_16%,transparent),0_0_0_4px_color-mix(in_srgb,var(--color-primary-4)_60%,transparent),0_0_16px_2px_color-mix(in_srgb,var(--color-primary-5)_50%,transparent)]',
  ),
  error: cn(
    'border-error bg-error/10 text-error',
    'dark:bg-error/18',
    'dark:shadow-[inset_0_0_6px_color-mix(in_srgb,var(--color-error)_45%,transparent),0_0_10px_-1px_color-mix(in_srgb,var(--color-error)_65%,transparent)]',
  ),
  pending: cn(
    'border-border-strong bg-bg-surface text-fg-muted',
    'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-sky-5)_14%,var(--color-bg-surface)),var(--color-bg-surface))]',
  ),
} satisfies Record<StepStatus, string>;

const STEPPER_NODE_ICON: Partial<Record<StepStatus, SystemIconName>> = {
  done: 'check-bold',
  error: 'xmark-bold',
};

const STEPPER_NODE_ICON_SIZE = {
  sm: 12,
  md: 14,
} satisfies Record<StepperSize, number>;

const STEPPER_RAIL_BASE_CLASSES = 'pointer-events-none bg-divider-strong dark:bg-sky-5/20';

const STEPPER_RAIL_LAYOUT_CLASSES = {
  'horizontal-center': {
    sm: 'absolute top-2.5 h-0.5 -translate-y-1/2 left-[calc(50%+18px)] right-[calc(-50%+18px)]',
    md: 'absolute top-3 h-0.5 -translate-y-1/2 left-[calc(50%+20px)] right-[calc(-50%+20px)]',
  },
  'horizontal-inline': {
    sm: 'relative top-2.5 h-0.5 min-w-6 flex-1 -translate-y-1/2',
    md: 'relative top-3 h-0.5 min-w-6 flex-1 -translate-y-1/2',
  },
  vertical: {
    sm: 'absolute left-2.5 top-6 bottom-1 w-0.5 -translate-x-1/2',
    md: 'absolute left-3 top-7 bottom-1 w-0.5 -translate-x-1/2',
  },
} satisfies Record<StepperLayout, Record<StepperSize, string>>;

/** Đoạn đã qua: sáng đặc `primary-5`; tối dốc đậm → sáng về phía bước sau + quầng. */
const STEPPER_RAIL_FILL_CLASSES = {
  'horizontal-center': cn(
    'absolute inset-0 origin-left bg-primary-5 animate-grow-x motion-reduce:animate-none',
    'dark:bg-linear-to-r dark:from-primary-6 dark:via-primary-5 dark:to-primary-3',
    'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
  ),
  'horizontal-inline': cn(
    'absolute inset-0 origin-left bg-primary-5 animate-grow-x motion-reduce:animate-none',
    'dark:bg-linear-to-r dark:from-primary-6 dark:via-primary-5 dark:to-primary-3',
    'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
  ),
  vertical: cn(
    'absolute inset-0 bg-primary-5',
    'dark:bg-linear-to-b dark:from-primary-6 dark:via-primary-5 dark:to-primary-3',
    'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
  ),
} satisfies Record<StepperLayout, string>;

function computeStatus(i: number, s: StepItem, active?: number): StepStatus {
  if (s.status != null) return s.status;
  if (active == null) return 'pending';
  if (i < active) return 'done';
  return i === active ? 'active' : 'pending';
}

interface StepNodeProps {
  status: StepStatus;
  number: number;
  size: StepperSize;
}

/**
 * StepNode — chấm trạng thái của một bước trong `Stepper` (nội bộ): icon ✓ / ✕ cho `done` / `error`,
 * số thứ tự cho `active` / `pending`.
 *
 * @param props.status - Trạng thái đã suy của bước.
 * @param props.number - Số thứ tự hiển thị (từ 1).
 * @param props.size - Cỡ chấm: `sm` 20px | `md` 24px.
 *
 * @example
 * <StepNode number={2} size="sm" status="active" />
 */
function StepNode({ status, number, size }: StepNodeProps) {
  const icon = STEPPER_NODE_ICON[status];
  const nodeClassName = cn(
    STEPPER_NODE_BASE_CLASSES,
    STEPPER_NODE_SIZE_CLASSES[size],
    STEPPER_NODE_STATUS_CLASSES[status],
  );

  return (
    <span className={nodeClassName}>
      {icon ? <SystemIcon aria-hidden name={icon} size={STEPPER_NODE_ICON_SIZE[size]} /> : number}
    </span>
  );
}

interface StepperStepProps {
  step: StepItem;
  status: StepStatus;
  number: number;
  isLast: boolean;
  layout: StepperLayout;
  size: StepperSize;
}

/**
 * StepperStep — một bước của `Stepper` (nội bộ): chấm + tiêu đề (+ mô tả) + đoạn nối sang bước sau.
 * Đoạn nối SAU bước `done` tô primary và mọc từ trái; còn lại là rãnh `divider-strong`.
 *
 * @param props.step - Dữ liệu bước `{ key, label, description?, status? }`.
 * @param props.status - Trạng thái đã suy của bước.
 * @param props.number - Số thứ tự hiển thị (từ 1).
 * @param props.isLast - Bước cuối — không vẽ đoạn nối, bỏ khoảng đệm dưới.
 * @param props.layout - Bố cục của `Stepper` cha.
 * @param props.size - Cỡ chấm của `Stepper` cha.
 *
 * @example
 * <StepperStep isLast={false} layout="vertical" number={1} size="sm" status="done" step={step} />
 */
function StepperStep({ step, status, number, isLast, layout, size }: StepperStepProps) {
  const contentClassName = cn(
    STEPPER_CONTENT_LAYOUT_CLASSES[layout],
    STEPPER_CONTENT_SIZE_CLASSES[size],
    isLast && 'pb-0',
  );
  const titleClassName = cn(
    STEPPER_TITLE_LAYOUT_CLASSES[layout],
    STEPPER_TITLE_STATUS_CLASSES[status],
  );
  const railClassName = cn(STEPPER_RAIL_BASE_CLASSES, STEPPER_RAIL_LAYOUT_CLASSES[layout][size]);

  return (
    <div
      aria-current={status === 'active' ? 'step' : undefined}
      className={STEPPER_ITEM_LAYOUT_CLASSES[layout]}
      role="listitem"
    >
      <StepNode number={number} size={size} status={status} />
      <div className={contentClassName}>
        <span className={titleClassName}>{step.label}</span>
        {step.description != null && (
          <span className={STEPPER_DESCRIPTION_LAYOUT_CLASSES[layout]}>{step.description}</span>
        )}
      </div>
      {!isLast && (
        <span aria-hidden className={railClassName}>
          {status === 'done' && <span className={STEPPER_RAIL_FILL_CLASSES[layout]} />}
        </span>
      )}
    </div>
  );
}

/**
 * Stepper — thanh tiến trình theo bước (hàng ngang hoặc cột dọc): chấm trạng thái + tiêu đề (+ mô tả) để
 * người dùng biết đang ở bước nào của một quy trình. Form nhiều bước có nút Tiếp / Quay lại thì dùng
 * `FormStepper` (đã ghép sẵn Stepper).
 *
 * Trạng thái mỗi bước suy từ `activeStep` (trước = `done`, bằng = `active`, sau = `pending`); bước khai
 * `status` tường minh thì thắng (vd `error`). Khung là `role="list"`, mỗi bước `listitem`; bước đang làm mang
 * `aria-current="step"`. Đoạn nối SAU bước `done` tô primary và mọc từ trái khi vừa xong; còn lại là rãnh
 * `divider-strong`.
 * Sửa giao diện: chấm → `STEPPER_NODE_STATUS_CLASSES` · tiêu đề → `STEPPER_TITLE_STATUS_CLASSES` ·
 * đường nối → `STEPPER_RAIL_LAYOUT_CLASSES` (vị trí) + `STEPPER_RAIL_FILL_CLASSES` (đoạn đã qua).
 * Lưu ý: toạ độ đường nối = nửa cỡ chấm (+ khe 8px) — đổi `STEPPER_NODE_SIZE_CLASSES` thì đổi cả bảng rail.
 *
 * @param props.steps - Danh sách bước `{ key, label, description?, status? }` theo thứ tự; `description` là
 *   dòng phụ dưới tiêu đề (người xử lý, hạn, lý do lỗi…).
 * @param props.activeStep - Bước đang làm, tính từ 0. Bỏ trống → mọi bước chưa khai `status` là `pending`.
 * @param props.layout - `horizontal-center` (nhãn dưới chấm) | `horizontal-inline` (nhãn cạnh chấm) |
 *   `vertical` (xếp cột). Mặc định `horizontal-center`.
 * @param props.size - Cỡ chấm: `sm` 20px | `md` 24px. Mặc định `sm`.
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.ref - Trỏ tới `<div>` khung ngoài (React 19: `ref` là prop thường).
 *
 * @example
 * <Stepper
 *   activeStep={1}
 *   steps={[
 *     { key: 'info', label: 'Thông tin', description: 'Hồ sơ' },
 *     { key: 'review', label: 'Kiểm tra' },
 *     { key: 'done', label: 'Hoàn tất' },
 *   ]}
 * />
 *
 * <Stepper layout="vertical" size="md" steps={[{ key: 'a', label: 'Tải tệp', status: 'error' }]} />
 */
function Stepper({
  steps,
  activeStep,
  layout = 'horizontal-center',
  size = 'sm',
  className,
  ref,
}: StepperProps) {
  const statuses = useMemo(
    () => steps.map((step, index) => computeStatus(index, step, activeStep)),
    [steps, activeStep],
  );

  const rootClassName = cn(STEPPER_ROOT_LAYOUT_CLASSES[layout], className);

  return (
    <div ref={ref} className={rootClassName} role="list">
      {steps.map((step, index) => (
        <StepperStep
          key={step.key}
          isLast={index === steps.length - 1}
          layout={layout}
          number={index + 1}
          size={size}
          status={statuses[index]}
          step={step}
        />
      ))}
    </div>
  );
}

export default Stepper;
