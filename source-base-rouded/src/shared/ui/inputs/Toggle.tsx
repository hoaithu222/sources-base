import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/shared/utils/style/cn';
import { CONTROL_FOCUS_RING_CLASS } from './field.theme';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  size?: ToggleSize;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const TOGGLE_WRAPPER_CLASSES = 'inline-flex cursor-pointer select-none items-center gap-2';

/**
 * Khoá: rãnh xám thay mảng xanh bạc màu — tắt = `bg-pressed` nhạt hơn rãnh thường, bật = `neutral-4` (+ núm nằm
 * phải) nên vẫn đọc được trạng thái. Tối: `neutral-4` đã lật thành xám sáng, nên bật khoá dùng `neutral-6`.
 */
const TOGGLE_DISABLED_CLASSES = cn(
  'disabled:data-[state=unchecked]:bg-bg-pressed',
  'disabled:data-[state=checked]:bg-neutral-4 dark:disabled:data-[state=checked]:bg-neutral-6',
);

/**
 * Công tắc kiểu macOS: rãnh viên thuốc — tắt = rãnh trung tính `bg-track` lõm nhẹ, bật = `primary-6` đặc; núm trắng
 * tròn lớn trượt 200ms. Rê khi tắt: sáng đậm lên `neutral-4`; tối sáng lên `neutral-7` (thang `neutral` lật theo theme).
 */
const TOGGLE_ROOT_BASE_CLASSES = cn(
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
  "touch:after:absolute touch:after:-inset-x-1 touch:after:-inset-y-3 touch:after:content-['']",
  'transition-[background-color,box-shadow] duration-200 ease-out',
  CONTROL_FOCUS_RING_CLASS,
  'data-[state=unchecked]:bg-bg-track',
  'data-[state=unchecked]:shadow-[inset_0_1px_2px_color-mix(in_srgb,var(--color-neutral-10)_12%,transparent)]',
  'enabled:hover:data-[state=unchecked]:bg-neutral-4 dark:enabled:hover:data-[state=unchecked]:bg-neutral-7',
  'data-[state=checked]:bg-primary-6 enabled:hover:data-[state=checked]:bg-primary-7',
  'disabled:cursor-not-allowed',
  TOGGLE_DISABLED_CLASSES,
);

/** `md` 38×22px (cỡ công tắc macOS). Núm = cao rãnh − 2×2px viền trong suốt. */
const TOGGLE_ROOT_SIZE_CLASSES = {
  sm: 'h-4 w-7',
  md: 'h-5.5 w-9.5',
  lg: 'h-6 w-11',
} satisfies Record<ToggleSize, string>;

/** Núm: trắng + bóng mềm 2 lớp (đổ sát 1px + loang 6px, như núm macOS), trượt 200ms. */
const TOGGLE_THUMB_BASE_CLASSES = cn(
  'pointer-events-none block rounded-full bg-neutral-0',
  'shadow-[0_1px_2px_color-mix(in_srgb,var(--color-neutral-10)_24%,transparent),0_2px_6px_-2px_color-mix(in_srgb,var(--color-neutral-10)_30%,transparent)]',
  'transition-[transform,box-shadow] duration-200 ease-out motion-reduce:transition-none',
  'data-[state=unchecked]:translate-x-0',
);

const TOGGLE_THUMB_SIZE_CLASSES = {
  sm: 'size-3 data-[state=checked]:translate-x-3',
  md: 'size-4.5 data-[state=checked]:translate-x-4',
  lg: 'size-5 data-[state=checked]:translate-x-5',
} satisfies Record<ToggleSize, string>;

const TOGGLE_LABEL_SIZE_CLASSES = {
  sm: 'text-caption-12 text-fg-heading',
  md: 'text-body-14 text-fg-heading',
  lg: 'text-body-16 text-fg-heading',
} satisfies Record<ToggleSize, string>;

/**
 * Toggle — công tắc bật / tắt một thiết lập có hiệu lực ngay (Radix Switch, `<button role="switch">`): bật =
 * nền `primary-6`, tắt = rãnh xám, núm trắng.
 *
 * Trong form react-hook-form dùng `ToggleField`; đồng ý / chọn mục trong danh sách thì dùng `Checkbox`.
 * Sửa giao diện: công tắc → `TOGGLE_ROOT_BASE_CLASSES` / `TOGGLE_ROOT_SIZE_CLASSES` · núm →
 * `TOGGLE_THUMB_*_CLASSES` · nhãn → `TOGGLE_LABEL_SIZE_CLASSES` · khung nhãn → `TOGGLE_WRAPPER_CLASSES`.
 * Lưu ý: không có `label` thì PHẢI truyền `aria-label` / `aria-labelledby` — công tắc lẻ loi (vd trong ô
 * bảng) chỉ được đọc là "switch, on". Nền bật là `primary-6`, KHÔNG `green-6` (màu trạng thái); `<label>`
 * bọc nút nên `onClick` chặn cú bấm vào chính nút (docs/notes/components/inputs.md, mục Toggle).
 *
 * @param props.checked - Trạng thái bật (controlled). Bỏ trống = tự quản.
 * @param props.defaultChecked - Trạng thái ban đầu khi tự quản. Mặc định `false`.
 * @param props.size - Cỡ công tắc (cao × rộng): `sm` 16×28px | `md` 22×38px | `lg` 24×44px (kéo theo cỡ chữ
 *   nhãn 12 / 14 / 16px). Mặc định `md`.
 * @param props.label - Chữ cạnh công tắc; bấm vào chữ cũng bật / tắt.
 * @param props.labelPosition - Chữ đứng `left` | `right` công tắc. Mặc định `right`.
 * @param props.disabled - `true` → rãnh xám, nhãn chuyển `fg-faint`, không bấm được. Mặc định `false`.
 * @param props.onCheckedChange - Gọi với trạng thái mới mỗi lần người dùng bật / tắt.
 * @param props.className - Class thêm: vào khung `<label>` khi có `label`, vào chính công tắc khi không có.
 * @param props.id - `id` của nút switch (nối với `<label htmlFor>` bên ngoài).
 * @param props.aria-label - Tên trợ năng khi KHÔNG có `label` (công tắc đứng một mình).
 * @param props.aria-labelledby - `id` của phần tử làm tên cho công tắc (thay `aria-label`).
 * @param props.aria-describedby - `id` của mô tả / dòng lỗi đi kèm.
 * @param props.aria-invalid - `true` → báo trình đọc màn hình là giá trị đang lỗi.
 * @param props.ref - Trỏ tới chính `<button role="switch">` (React 19: `ref` là prop thường).
 *
 * @example
 * <Toggle checked={notify} label="Nhận thông báo" onCheckedChange={setNotify} />
 *
 * <Toggle aria-label="Kích hoạt tài khoản" checked={row.active} size="sm" onCheckedChange={onActiveChange} />
 */
function Toggle({
  checked,
  defaultChecked,
  size = 'md',
  label,
  labelPosition = 'right',
  disabled,
  onCheckedChange,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ref,
}: ToggleProps) {
  const rootClassName = cn(
    TOGGLE_ROOT_BASE_CLASSES,
    TOGGLE_ROOT_SIZE_CLASSES[size],
    !label && className,
  );
  const thumbClassName = cn(TOGGLE_THUMB_BASE_CLASSES, TOGGLE_THUMB_SIZE_CLASSES[size]);

  const switchEl = (
    <SwitchPrimitive.Root
      ref={ref}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      checked={checked}
      className={rootClassName}
      defaultChecked={defaultChecked}
      disabled={disabled}
      id={id}
      onCheckedChange={onCheckedChange}
    >
      <SwitchPrimitive.Thumb className={thumbClassName} />
    </SwitchPrimitive.Root>
  );

  if (!label) return switchEl;

  const wrapperClassName = cn(TOGGLE_WRAPPER_CLASSES, disabled && 'cursor-not-allowed', className);
  const labelClassName = cn(TOGGLE_LABEL_SIZE_CLASSES[size], disabled && 'text-fg-faint');
  const labelEl = <span className={labelClassName}>{label}</span>;

  return (
    <label
      className={wrapperClassName}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[role="switch"]')) event.preventDefault();
      }}
    >
      {labelPosition === 'left' && labelEl}
      {switchEl}
      {labelPosition === 'right' && labelEl}
    </label>
  );
}

export default Toggle;
