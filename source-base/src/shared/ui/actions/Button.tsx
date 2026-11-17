import { Slot, Slottable } from '@radix-ui/react-slot';
import Spinner from '@/shared/ui/feedback/Spinner';
import { cn } from '@/shared/utils/style/cn';

import {
  BUTTON_BASE_CLASSES,
  BUTTON_END_ICON_MOTION_CLASSES,
  BUTTON_ICON_BASE_CLASSES,
  BUTTON_ICON_SIZE_CLASSES,
  BUTTON_SIZE_CLASSES,
  BUTTON_SKIN_CLASSES,
} from './button.theme';
import type { ButtonSize, ButtonSkin, ButtonVariant } from './button.types';

export interface ButtonProps extends React.ComponentProps<'button'> {
  skin?: ButtonSkin;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  asChild?: boolean;
}

/**
 * Button — nút bấm chuẩn của UI kit; mọi chỗ cần "bấm để làm một việc" đều dùng nút này.
 *
 * Nhận thêm mọi thuộc tính của `<button>` (`onClick`, `disabled`, `aria-*`, `form`…).
 * Điều hướng sang trang khác thì bọc `<Link>` bằng `asChild` (docs/rules/interaction/navigable-controls.md).
 * Sửa giao diện: màu → `BUTTON_SKIN_CLASSES[skin][variant]` · cỡ → `BUTTON_SIZE_CLASSES`
 * · nền chung (focus, disabled, loading) → `BUTTON_BASE_CLASSES`.
 * Lưu ý: kiểu nền trong (secondary / stroke / ghost) dùng token semantic cho chữ / viền (`action-*`,
 * `error`), KHÔNG dùng bậc số; kiểu nền đặc (primary) giữ chữ màu cố định;
 * `touch:` chỉ siết, không nới (docs/rules/display/ipad-responsive.md §3.0) — hộp bấm ≥ 44px nhờ `::after`
 * trong suốt nên nút là `relative`; nơi dùng đè `absolute` / `fixed` qua `className` thì vẫn được.
 *
 * @param props.skin - Bảng màu: `base` (xanh thương hiệu) | `accent` (vàng) | `danger` (đỏ, thao tác
 *   phá huỷ) | `neutral` (xám). Mặc định `base`.
 * @param props.variant - Kiểu tô: `primary` (nền đặc) | `secondary` (nền nhạt có viền) | `stroke` (chỉ
 *   viền) | `ghost` (trong suốt). Mặc định `primary`.
 * @param props.size - Cỡ nút: `xl` 44px | `lg` 40px | `md` 36px | `sm` 32px | `xs` 28px. Mặc định `xl`.
 * @param props.fullWidth - `true` → giãn hết bề ngang khung chứa. Mặc định `false`.
 * @param props.startIcon - Icon trước chữ (thường là `<SystemIcon />`); bị thay bằng spinner khi `loading`.
 * @param props.endIcon - Icon sau chữ; ẩn khi `loading`.
 * @param props.loading - `true` → hiện spinner, chặn bấm, gắn `aria-busy`. Mặc định `false`.
 * @param props.asChild - `true` → render phần tử con (vd `<Link>`) thay cho `<button>`, gộp class + ref
 *   vào nó; khi đó KHÔNG gắn `disabled` / `type`.
 * @param props.type - Mặc định `'button'` (không tự gửi form); nút gửi form khai `type="submit"`.
 * @param props.ref - Trỏ tới phần tử `<button>` (React 19: `ref` là prop thường, không cần `forwardRef`).
 *
 * @example
 * <Button skin="danger" variant="stroke" size="md" startIcon={<SystemIcon name="trash-outline" />}>
 *   Xoá
 * </Button>
 *
 * <Button asChild variant="ghost">
 *   <Link to="/settings">Cài đặt</Link>
 * </Button>
 */
function Button({
  skin = 'base',
  variant = 'primary',
  size = 'xl',
  fullWidth = false,
  startIcon,
  endIcon,
  loading = false,
  asChild = false,
  disabled,
  className,
  children,
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  const iconClassName = cn(BUTTON_ICON_BASE_CLASSES, BUTTON_ICON_SIZE_CLASSES[size]);

  const buttonClassName = cn(
    BUTTON_BASE_CLASSES,
    BUTTON_SIZE_CLASSES[size],
    BUTTON_SKIN_CLASSES[skin][variant],
    fullWidth && 'w-full',
    className,
  );

  return (
    <Comp
      ref={ref}
      aria-busy={loading || undefined}
      className={buttonClassName}
      disabled={asChild ? undefined : isDisabled}
      type={asChild ? undefined : type}
      {...props}
    >
      {loading ? (
        <span className={iconClassName}>
          <Spinner className="size-full" color="inherit" size="sm" />
        </span>
      ) : (
        startIcon && <span className={iconClassName}>{startIcon}</span>
      )}
      <Slottable>{children}</Slottable>
      {!loading && endIcon && (
        <span className={cn(iconClassName, BUTTON_END_ICON_MOTION_CLASSES)}>{endIcon}</span>
      )}
    </Comp>
  );
}

export default Button;
