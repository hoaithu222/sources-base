'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';

export type CalloutIntent = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type CalloutVariant = 'tinted' | 'ghost';

export interface CalloutProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  intent?: CalloutIntent;
  variant?: CalloutVariant;
  icon?: BoldSystemIconName | React.ReactNode | false;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

const CALLOUT_BASE_CLASSES = 'flex items-start gap-3 text-fg-body';

const CALLOUT_ICON_BASE_CLASSES = 'flex h-5 shrink-0 items-center justify-center';

const CALLOUT_TITLE_CLASSES = 'text-body-14-semibold text-fg-heading';

const CALLOUT_DESCRIPTION_CLASSES = 'text-body-14 text-fg-body';

const CALLOUT_CLOSE_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  '-mr-1 -my-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-sm',
  'cursor-pointer text-fg-muted transition-[color,background-color] duration-150 ease-out',
  'hover:bg-bg-pressed hover:text-fg-heading',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

/**
 * `tinted`: hộp bo `rounded-lg`, viền 1px tone 25% đều bốn cạnh + nền tone 8% (không ray trái). Màu tone là token tự lật
 * theo theme nên cùng công thức đọc được trên nền tối.
 */
const CALLOUT_VARIANT_CLASSES = {
  tinted: 'relative rounded-lg border px-3 py-2.5',
  ghost: 'py-1',
} satisfies Record<CalloutVariant, string>;

/** Viền tone 25% + nền tone 8%. */
const CALLOUT_INTENT_CLASSES = {
  info: 'border-info/25 bg-info/8 dark:border-info/45 dark:bg-info/16',
  success: 'border-success/25 bg-success/8 dark:border-success/45 dark:bg-success/16',
  warning: 'border-warning/25 bg-warning/8 dark:border-warning/45 dark:bg-warning/16',
  error: 'border-error/25 bg-error/8 dark:border-error/45 dark:bg-error/16',
  neutral: 'border-border-default bg-bg-subtle',
} satisfies Record<CalloutIntent, string>;

const CALLOUT_ICON_INTENT_CLASSES = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-fg-muted',
} satisfies Record<CalloutIntent, string>;

const CALLOUT_DEFAULT_ICONS = {
  info: 'circle-exclamation-bold',
  success: 'circle-check-bold',
  warning: 'triangle-exclamation-bold',
  error: 'circle-xmark-bold',
  neutral: 'bell-bold',
} satisfies Record<CalloutIntent, BoldSystemIconName>;

const isIconName = (value: unknown): value is BoldSystemIconName => typeof value === 'string';

function renderIcon(icon: CalloutProps['icon'], intent: CalloutIntent) {
  if (icon === undefined) return <SystemIcon name={CALLOUT_DEFAULT_ICONS[intent]} size={16} />;
  if (isIconName(icon)) return <SystemIcon name={icon} size={16} />;
  return icon;
}

/**
 * Callout — khối thông báo nằm TRONG trang (alert / banner): cảnh báo sắp hết hạn, lỗi tải dữ liệu,
 * gợi ý. Thông báo tạm thời góc màn hình thì dùng toast (`showToast`), không dùng Callout.
 *
 * `intent="error"` gắn `role="alert"` (trình đọc màn hình đọc ngay), các intent khác `role="status"`.
 * Sửa giao diện: khung theo kiểu → `CALLOUT_VARIANT_CLASSES` · màu khung `tinted` → `CALLOUT_INTENT_CLASSES`
 * · màu icon → `CALLOUT_ICON_INTENT_CLASSES` · icon mặc định → `CALLOUT_DEFAULT_ICONS`
 * · nút đóng → `CALLOUT_CLOSE_CLASSES`.
 * Lưu ý: chữ LUÔN là token chữ (tiêu đề `fg-heading`, nội dung `fg-body`); màu intent chỉ ở icon, viền
 * và nền nhạt. `warning` là cam (token `warning`), không phải vàng.
 * Lưu ý: chuỗi bất kỳ truyền vào `icon` đều bị hiểu là TÊN icon; icon tuỳ biến thì truyền ReactNode
 * (`<SystemIcon … />`).
 *
 * @param props.title - Tiêu đề ngắn, nét Semibold, dòng đầu.
 * @param props.description - Nội dung chi tiết dưới tiêu đề; không truyền thì dùng `children`.
 * @param props.children - Nội dung chi tiết khi không có `description`.
 * @param props.intent - Ngữ nghĩa + màu: `info` | `success` | `warning` | `error` | `neutral`. Mặc định `info`.
 * @param props.variant - `tinted` (nền nhạt + viền cùng tông) | `ghost` (không nền / viền / đệm
 *   ngang). Mặc định `tinted`.
 * @param props.icon - Tên icon `-bold` | ReactNode tuỳ biến | `false` để ẩn. Mặc định icon theo `intent`.
 * @param props.closable - `true` → nút × "Đóng" ở biên phải. Mặc định `false`.
 * @param props.onClose - Gọi khi bấm nút ×; Callout KHÔNG tự ẩn — caller bỏ nó khỏi cây.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <Callout intent="warning" title="Sắp hết hạn" description="Hợp đồng còn 3 ngày." />
 *
 * {visible && (
 *   <Callout closable intent="error" title="Không tải được dữ liệu" onClose={() => setVisible(false)} />
 * )}
 */
const Callout = memo(function Callout({
  title,
  description,
  children,
  intent = 'info',
  variant = 'tinted',
  icon,
  closable = false,
  onClose,
  className,
}: CalloutProps) {
  const t = useTranslations('ui.common');
  const content = description ?? children;

  const calloutClassName = cn(
    CALLOUT_BASE_CLASSES,
    CALLOUT_VARIANT_CLASSES[variant],
    variant === 'tinted' && CALLOUT_INTENT_CLASSES[intent],
    className,
  );
  const iconClassName = cn(CALLOUT_ICON_BASE_CLASSES, CALLOUT_ICON_INTENT_CLASSES[intent]);

  return (
    <div className={calloutClassName} role={intent === 'error' ? 'alert' : 'status'}>
      {icon !== false && <span className={iconClassName}>{renderIcon(icon, intent)}</span>}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title != null && <div className={CALLOUT_TITLE_CLASSES}>{title}</div>}
        {content != null && <div className={CALLOUT_DESCRIPTION_CLASSES}>{content}</div>}
      </div>
      {closable && (
        <button
          aria-label={t('close')}
          className={CALLOUT_CLOSE_CLASSES}
          type="button"
          onClick={() => onClose?.()}
        >
          <SystemIcon name="xmark-bold" size={14} />
        </button>
      )}
    </div>
  );
});

export default Callout;
