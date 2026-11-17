import * as ToastPrimitive from '@radix-ui/react-toast';
import { SystemIcon } from '@/shared/ui/icons/Icons';
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

const TOAST_ROOT_CLASSES = cn(
  'relative flex w-full max-w-[400px] items-start gap-3 overflow-hidden p-3',
  'border border-border-popup backdrop-blur-md',
  'shadow-[0_12px_32px_-8px_var(--color-shadow-popup)]',
  "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
  "dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:top-0 dark:after:h-px dark:after:content-['']",
  'dark:after:bg-linear-to-r dark:after:to-transparent',
  'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-fade-out',
  'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
  'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
  'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
);

const TOAST_ROOT_TYPE_CLASSES = {
  success: cn(
    'before:bg-success dark:border-success/40',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-success)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-success)_24%,var(--color-bg-popup)),color-mix(in_srgb,var(--color-success)_6%,var(--color-bg-popup))_55%,var(--color-bg-popup))]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-success)_10%,transparent),0_0_26px_-8px_color-mix(in_srgb,var(--color-success)_50%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:before:shadow-[0_0_10px_1px_color-mix(in_srgb,var(--color-success)_75%,transparent)]',
    'dark:after:from-success dark:after:via-success/35',
  ),
  error: cn(
    'before:bg-error dark:border-error/40',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-error)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-error)_24%,var(--color-bg-popup)),color-mix(in_srgb,var(--color-error)_6%,var(--color-bg-popup))_55%,var(--color-bg-popup))]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-error)_10%,transparent),0_0_26px_-8px_color-mix(in_srgb,var(--color-error)_50%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:before:shadow-[0_0_10px_1px_color-mix(in_srgb,var(--color-error)_75%,transparent)]',
    'dark:after:from-error dark:after:via-error/35',
  ),
  warning: cn(
    'before:bg-warning dark:border-warning/40',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-warning)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-warning)_24%,var(--color-bg-popup)),color-mix(in_srgb,var(--color-warning)_6%,var(--color-bg-popup))_55%,var(--color-bg-popup))]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-warning)_10%,transparent),0_0_26px_-8px_color-mix(in_srgb,var(--color-warning)_50%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:before:shadow-[0_0_10px_1px_color-mix(in_srgb,var(--color-warning)_75%,transparent)]',
    'dark:after:from-warning dark:after:via-warning/35',
  ),
  info: cn(
    'before:bg-info dark:border-info/40',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-info)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-info)_24%,var(--color-bg-popup)),color-mix(in_srgb,var(--color-info)_6%,var(--color-bg-popup))_55%,var(--color-bg-popup))]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-info)_10%,transparent),0_0_26px_-8px_color-mix(in_srgb,var(--color-info)_50%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:before:shadow-[0_0_10px_1px_color-mix(in_srgb,var(--color-info)_75%,transparent)]',
    'dark:after:from-info dark:after:via-info/35',
  ),
} satisfies Record<ToastType, string>;

const TOAST_INNER_CLASSES = 'flex min-w-0 flex-1 items-start gap-3';

const TOAST_ICON_WRAP_CLASSES =
  'inline-flex size-7 shrink-0 items-center justify-center rounded-full';

const TOAST_ICON_WRAP_TYPE_CLASSES = {
  success: cn(
    'bg-success/15',
    'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-success)_45%,transparent),0_0_12px_-2px_color-mix(in_srgb,var(--color-success)_55%,transparent)]',
  ),
  error: cn(
    'bg-error/15',
    'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_45%,transparent),0_0_12px_-2px_color-mix(in_srgb,var(--color-error)_55%,transparent)]',
  ),
  warning: cn(
    'bg-warning/15',
    'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-warning)_45%,transparent),0_0_12px_-2px_color-mix(in_srgb,var(--color-warning)_55%,transparent)]',
  ),
  info: cn(
    'bg-info/15',
    'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-info)_45%,transparent),0_0_12px_-2px_color-mix(in_srgb,var(--color-info)_55%,transparent)]',
  ),
} satisfies Record<ToastType, string>;

const TOAST_ICON_BASE_CLASSES = 'size-4';

const TOAST_ICON_TYPE_CLASSES = {
  success:
    'text-success dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-success)_85%,transparent)]',
  error:
    'text-error dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-error)_85%,transparent)]',
  warning:
    'text-warning dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-warning)_85%,transparent)]',
  info: 'text-info dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-info)_85%,transparent)]',
} satisfies Record<ToastType, string>;

const TOAST_BODY_CLASSES = 'flex min-w-0 flex-1 cursor-text select-text flex-col gap-0.5 py-1';

const TOAST_TITLE_CLASSES = 'break-words text-body-14-semibold text-fg-heading';

const TOAST_DESCRIPTION_CLASSES = 'break-words text-body text-fg-body';

const TOAST_ACTION_CLASSES = cn(
  'inline-flex h-7 shrink-0 cursor-pointer items-center px-2 text-caption-12-semibold text-link',
  'transition-colors duration-150 ease-out hover:bg-primary-5/10 active:bg-primary-5/20',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const TOAST_CLOSE_CLASSES = cn(
  'relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-fg-muted outline-none',
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
 * Sửa giao diện: màu theo loại → `TOAST_ROOT_TYPE_CLASSES` (vạch trái · nền · viền / quầng · ray đỉnh dark) ·
 * `TOAST_ICON_WRAP_TYPE_CLASSES` · `TOAST_ICON_TYPE_CLASSES` · khung chung → `TOAST_ROOT_CLASSES`.
 * Màu loại là token trạng thái (`success` / `error` / `warning` / `info` — tự đổi theo theme), KHÔNG bậc
 * số cố định; quầng màu chỉ qua `dark:`.
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
  const rootClassName = cn(TOAST_ROOT_CLASSES, TOAST_ROOT_TYPE_CLASSES[type], className);
  const iconWrapClassName = cn(TOAST_ICON_WRAP_CLASSES, TOAST_ICON_WRAP_TYPE_CLASSES[type]);
  const iconClassName = cn(TOAST_ICON_BASE_CLASSES, TOAST_ICON_TYPE_CLASSES[type]);

  return (
    <ToastPrimitive.Root ref={ref} className={rootClassName} {...rest}>
      <div className={TOAST_INNER_CLASSES}>
        <span className={iconWrapClassName}>
          <SystemIcon className={iconClassName} name={TOAST_ICON_NAMES[type]} />
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
        <ToastPrimitive.Close aria-label="Đóng" className={TOAST_CLOSE_CLASSES}>
          <SystemIcon className="size-4" name="xmark-outline" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}

/** Radix Toast.Provider — bọc app một lần. */
export const ToastProvider = ToastPrimitive.Provider;

export default Toast;
