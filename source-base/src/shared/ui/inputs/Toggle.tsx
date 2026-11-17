import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/shared/utils/style/cn';

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

const TOGGLE_ROOT_BASE_CLASSES = cn(
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
  "touch:after:absolute touch:after:-inset-x-1 touch:after:-inset-y-3 touch:after:content-['']",
  'transition-[background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'data-[state=unchecked]:bg-neutral-4 dark:data-[state=unchecked]:bg-neutral-7',
  'enabled:hover:data-[state=unchecked]:bg-neutral-5',
  'dark:enabled:hover:data-[state=unchecked]:bg-neutral-6',
  'data-[state=checked]:bg-primary-6 enabled:hover:data-[state=checked]:bg-primary-7',
  'dark:data-[state=unchecked]:shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--color-neutral-10)_60%,transparent)]',
  'dark:data-[state=checked]:bg-linear-to-b dark:data-[state=checked]:from-primary-5 dark:data-[state=checked]:to-primary-7',
  'dark:enabled:hover:data-[state=checked]:from-primary-4 dark:enabled:hover:data-[state=checked]:to-primary-6',
  'dark:data-[state=checked]:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_28%,transparent),0_0_10px_-1px_color-mix(in_srgb,var(--color-primary-5)_65%,transparent)]',
  'disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:data-[state=checked]:shadow-none',
);

/** Hộp bấm cảm ứng ≥ 44px mỗi chiều: `sm` nới thêm 8 / 14px, `md` dùng mức của gốc, `lg` đã đủ. */
const TOGGLE_ROOT_SIZE_CLASSES = {
  sm: 'h-4 w-7 touch:after:-inset-x-2 touch:after:-inset-y-3.5',
  md: 'h-5 w-9',
  lg: 'h-6 w-11',
} satisfies Record<ToggleSize, string>;

/** Núm: sáng = trắng phẳng + bóng; tối = dốc trắng → `neutral-3` + bóng đậm, bật thì quầng xanh. Trượt bằng `translate` (không `transform`). */
const TOGGLE_THUMB_BASE_CLASSES = cn(
  'pointer-events-none block rounded-full bg-neutral-0',
  'shadow-[0_1px_3px_color-mix(in_srgb,var(--color-neutral-10)_35%,transparent)]',
  'transition-[translate,box-shadow] duration-150 ease-out motion-reduce:transition-none',
  'data-[state=unchecked]:translate-x-0',
  'dark:bg-linear-to-b dark:from-neutral-0 dark:to-neutral-3',
  'dark:shadow-[0_1px_3px_color-mix(in_srgb,var(--color-neutral-10)_65%,transparent),inset_0_-1px_1px_color-mix(in_srgb,var(--color-neutral-5)_50%,transparent)]',
  'dark:data-[state=checked]:shadow-[0_0_6px_color-mix(in_srgb,var(--color-primary-3)_75%,transparent),0_1px_3px_color-mix(in_srgb,var(--color-neutral-10)_65%,transparent)]',
);

const TOGGLE_THUMB_SIZE_CLASSES = {
  sm: 'size-3 data-[state=checked]:translate-x-3',
  md: 'size-4 data-[state=checked]:translate-x-4',
  lg: 'size-5 data-[state=checked]:translate-x-5',
} satisfies Record<ToggleSize, string>;

const TOGGLE_LABEL_SIZE_CLASSES = {
  sm: 'text-caption-12 text-fg-heading',
  md: 'text-body-14 text-fg-heading',
  lg: 'text-body-16 text-fg-heading',
} satisfies Record<ToggleSize, string>;

/**
 * Toggle — công tắc bật / tắt một thiết lập có hiệu lực ngay (Radix Switch, `<button role="switch">`): bật =
 * nền `primary-6` (dark thêm quầng brand), tắt = rãnh xám, núm trắng.
 *
 * Trong form react-hook-form dùng `ToggleField`; đồng ý / chọn mục trong danh sách thì dùng `Checkbox`.
 * Sửa giao diện: công tắc → `TOGGLE_ROOT_BASE_CLASSES` / `TOGGLE_ROOT_SIZE_CLASSES` · núm →
 * `TOGGLE_THUMB_*_CLASSES` · nhãn → `TOGGLE_LABEL_SIZE_CLASSES` · khung nhãn → `TOGGLE_WRAPPER_CLASSES`.
 * Lưu ý: không có `label` thì PHẢI truyền `aria-label` / `aria-labelledby` — công tắc lẻ loi (vd trong ô
 * bảng) chỉ được đọc là "switch, on". Nền bật là `primary-6`, KHÔNG `green-6` (màu trạng thái); núm trượt
 * bằng `translate` nên chuyển tiếp là `transition-[translate]` (docs/notes/components/inputs.md, mục Toggle).
 *
 * @param props.checked - Trạng thái bật (controlled). Bỏ trống = tự quản.
 * @param props.defaultChecked - Trạng thái ban đầu khi tự quản. Mặc định `false`.
 * @param props.size - Cỡ công tắc (cao × rộng): `sm` 16×28px | `md` 20×36px | `lg` 24×44px (kéo theo cỡ chữ
 *   nhãn 12 / 14 / 16px). Mặc định `md`.
 * @param props.label - Chữ cạnh công tắc; bấm vào chữ cũng bật / tắt.
 * @param props.labelPosition - Chữ đứng `left` | `right` công tắc. Mặc định `right`.
 * @param props.disabled - `true` → mờ đi (nhãn chuyển `fg-faint`), không bấm được. Mặc định `false`.
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
