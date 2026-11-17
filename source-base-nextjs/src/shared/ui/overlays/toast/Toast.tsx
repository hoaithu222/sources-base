'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { FLOATING_SURFACE_LIGHT_CLASS } from '@/shared/ui/overlays/popup-surface.theme';
import { cn } from '@/shared/utils/style/cn';
import type { SystemIconName } from '@/shared/ui/icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Action inline trên toast (vd "Hoàn tác"); click → `onClick` chạy rồi toast tự đóng. */
export interface ToastActionSpec {
  label: string;
  onClick: () => void;
}

export interface ToastProps extends Omit<
  React.ComponentProps<typeof ToastPrimitive.Root>,
  'title' | 'type'
> {
  type?: ToastType;
  title: string;
  description?: string;
  closable?: boolean;
  action?: ToastActionSpec;
}

const TOAST_ICON_NAMES = {
  success: 'circle-check-outline',
  error: 'circle-xmark-outline',
  warning: 'triangle-exclamation-outline',
  info: 'circle-exclamation-outline',
} satisfies Record<ToastType, SystemIconName>;

/**
 * Thẻ thông báo ĐỤC kiểu banner macOS, cùng mặt nổi với popover / menu (`FLOATING_SURFACE_LIGHT_CLASS`: nền đặc, viền 1px
 * `border-strong`, bóng 3 lớp), bo `xl` — KHÔNG kính (nền alpha + mờ lộ thẻ KPI phía sau, chữ nhoè). Loại đọc qua Ô ICON
 * tông nhạt có vòng trong cùng tông.
 */
const TOAST_ROOT_CLASSES = cn(
  'relative flex w-full max-w-[400px] items-start gap-3 overflow-hidden rounded-xl border p-3',
  FLOATING_SURFACE_LIGHT_CLASS,
  'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-fade-out',
  'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
  'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
  'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
);

/** Tông theo loại = MỘT biến `--toast-tone` trên gốc; ô icon + icon đọc biến (một bộ class cho 4 loại). */
const TOAST_TONE_CLASSES = {
  success: '[--toast-tone:var(--color-success)]',
  error: '[--toast-tone:var(--color-error)]',
  warning: '[--toast-tone:var(--color-warning)]',
  info: '[--toast-tone:var(--color-info)]',
} satisfies Record<ToastType, string>;

const TOAST_INNER_CLASSES = 'flex min-w-0 flex-1 items-start gap-3';

/** Ô icon = nơi đọc LOẠI thông báo: ô vuông bo `lg` 32px nền tông 15% + vòng trong tông 25% (mép ô sắc trên thẻ). */
const TOAST_ICON_WRAP_CLASSES = cn(
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
  'bg-(--toast-tone)/15 ring-1 ring-inset ring-(--toast-tone)/25',
);

const TOAST_ICON_CLASSES = 'size-4 text-(--toast-tone)';

const TOAST_BODY_CLASSES = 'flex min-w-0 flex-1 cursor-text select-text flex-col gap-0.5 py-1.5';

const TOAST_TITLE_CLASSES = 'break-words text-body-14-semibold text-fg-heading';

/** Mô tả: 13px `fg-body` (dòng phụ dưới tiêu đề đậm, đủ tương phản để đọc lướt). */
const TOAST_DESCRIPTION_CLASSES = 'break-words text-body-13 text-fg-body';

const TOAST_ACTION_CLASSES = cn(
  'inline-flex h-7 shrink-0 cursor-pointer items-center rounded-sm px-2 text-caption-12-semibold text-link',
  'transition-colors duration-150 ease-out hover:bg-primary-5/10 active:bg-primary-5/20',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const TOAST_CLOSE_CLASSES = cn(
  'relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-fg-muted outline-none',
  "after:absolute after:-inset-2 after:content-['']",
  'transition-colors duration-150 ease-out hover:bg-bg-nav-hover hover:text-fg-heading',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
  'max-lg:size-8 max-lg:bg-fg-heading/10 max-lg:text-fg-heading',
  'touch:size-8 touch:bg-fg-heading/10 touch:text-fg-heading',
);

/** Gắn vào vùng chữ: chuột kéo để bôi đen không kích hoạt vuốt-để-đóng; chạm / pen vẫn vuốt. */
const stopMouseSwipe = (e: React.PointerEvent<HTMLDivElement>) => {
  if (e.pointerType === 'mouse') e.stopPropagation();
};

/**
 * Toast — một thông báo nổi (Radix Toast, Figma 469:4791): live region, vuốt sang phải để đóng, tự tắt
 * sau `duration`. Code thường KHÔNG render trực tiếp mà gọi `showToast()` / `showErrorToast()`
 * (`@/shared/ui`) — `ToastContainer` gắn sẵn ở `AppOverlays` sẽ hiện nó.
 *
 * Ghép thô (hiếm): `<ToastProvider><Toast open={open} onOpenChange={setOpen} … /><ToastViewport />
 * </ToastProvider>`. Nhận thêm mọi prop của Radix `Toast.Root` (`duration`, `onOpenChange`…).
 * Thông báo tiến trình (thanh %, tự đóng khi xong) thì dùng `@/shared/widgets/progress-center`.
 * Sửa giao diện: màu theo loại → `TOAST_TONE_CLASSES` (biến `--toast-tone`, chỉ hiện ở ô icon + icon) · khung chung →
 * `TOAST_ROOT_CLASSES` (mặt nổi đục dùng chung `FLOATING_SURFACE_LIGHT_CLASS` của `popup-surface.theme`).
 * Màu loại là token trạng thái (`success` / `error` / `warning` / `info` — tự đổi theo theme), KHÔNG bậc
 * số cố định, KHÔNG quầng.
 * Lưu ý: chuột kéo trong vùng chữ để bôi đen / copy KHÔNG kích hoạt vuốt-để-đóng (chạm / pen vẫn vuốt)
 * — notes/components/overlays.md#toast.
 *
 * @param props.type - Loại: `success` | `error` | `warning` | `info` — đổi icon + màu. Mặc định `info`.
 * @param props.title - Dòng tiêu đề (bắt buộc).
 * @param props.description - Dòng mô tả dưới tiêu đề.
 * @param props.closable - Hiện nút ✕ (nhãn "Đóng"; tablet / điện thoại 32px, vùng chạm 44px). Mặc định `true`.
 * @param props.action - Nút hành động trong toast (vd "Hoàn tác"): bấm → `onClick` chạy rồi toast đóng.
 * @param props.open - Trạng thái hiện (controlled); `onOpenChange(false)` khi hết giờ / vuốt / bấm ✕.
 * @param props.duration - Thời gian tự tắt (ms). Mặc định theo `ToastProvider` (5000).
 * @param props.ref - Trỏ tới phần tử `<li>` của toast (React 19: `ref` là prop thường).
 *
 * @example
 * <Toast open={open} onOpenChange={setOpen} type="success" title="Đã lưu" description="Hạng mục A" />
 *
 * <Toast
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Đã xoá 3 mục"
 *   action={{ label: 'Hoàn tác', onClick: undo }}
 * />
 */
function Toast({
  type = 'info',
  title,
  description,
  closable = true,
  action,
  className,
  ref,
  ...rest
}: ToastProps) {
  const t = useTranslations('ui.common');
  const rootClassName = cn(TOAST_ROOT_CLASSES, TOAST_TONE_CLASSES[type], className);

  return (
    <ToastPrimitive.Root ref={ref} className={rootClassName} {...rest}>
      <div className={TOAST_INNER_CLASSES}>
        <span className={TOAST_ICON_WRAP_CLASSES}>
          <SystemIcon className={TOAST_ICON_CLASSES} name={TOAST_ICON_NAMES[type]} />
        </span>
        <div className={TOAST_BODY_CLASSES} onPointerDown={stopMouseSwipe}>
          <ToastPrimitive.Title className={TOAST_TITLE_CLASSES}>{title}</ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className={TOAST_DESCRIPTION_CLASSES}>
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
      </div>
      {action && (
        <ToastPrimitive.Action altText={action.label} asChild onClick={action.onClick}>
          <button className={TOAST_ACTION_CLASSES} type="button">
            {action.label}
          </button>
        </ToastPrimitive.Action>
      )}
      {closable && (
        <ToastPrimitive.Close aria-label={t('close')} className={TOAST_CLOSE_CLASSES}>
          <SystemIcon className="size-4" name="xmark-outline" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}

/** Radix Toast.Provider — bọc app một lần. */
export const ToastProvider = ToastPrimitive.Provider;

export default Toast;
