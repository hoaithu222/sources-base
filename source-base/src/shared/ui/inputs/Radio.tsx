import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { HUD_LIT_FILL } from '@/shared/ui/primitives/hud.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { cn } from '@/shared/utils/style/cn';

export interface RadioProps extends Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Item>,
  'asChild'
> {
  label?: React.ReactNode;
}

const RADIO_ROOT_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  'peer inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border',
  'transition-[background-color,border-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'data-[state=unchecked]:border-border-strong data-[state=unchecked]:bg-bg-input',
  'enabled:hover:border-primary-5 enabled:group-hover/radio:border-primary-5',
  'data-[state=checked]:border-primary-6 data-[state=checked]:bg-primary-6',
  HUD_LIT_FILL,
  'dark:data-[state=unchecked]:border-hud-5/50',
  'dark:enabled:hover:border-primary-4 dark:enabled:group-hover/radio:border-primary-4',
  'dark:data-[state=checked]:border-primary-4 dark:data-[state=checked]:bg-linear-to-b',
  'dark:data-[state=checked]:from-primary-5 dark:data-[state=checked]:to-primary-7',
  'dark:data-[state=checked]:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_35%,transparent),0_0_8px_-1px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
  'disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:data-[state=checked]:shadow-none',
);

const RADIO_DOT_CLASSES = cn(
  'block size-1.5 rounded-full bg-neutral-0 animate-pop-in motion-reduce:animate-none',
  'dark:shadow-[0_0_4px_color-mix(in_srgb,var(--color-neutral-0)_70%,transparent)]',
);

const RADIO_LABEL_WRAPPER_CLASSES = cn(
  'group/radio inline-flex cursor-pointer select-none items-center gap-2',
  'has-[:disabled]:cursor-not-allowed',
);

const RADIO_LABEL_CLASSES = 'text-body-14 text-fg-heading peer-disabled:text-fg-faint';

/**
 * Radio — một lựa chọn trong nhóm chọn-một (Radix RadioGroup.Item): vòng tròn 16px, đang chọn thì nền + viền
 * `primary-6` và chấm `neutral-0`.
 *
 * LUÔN đặt trong `<RadioGroup>` (giữ giá trị, ↑ ↓ ← → đi giữa các ô). Nhận thêm mọi prop của Radix
 * `RadioGroup.Item` (`value`, `disabled`, `id`, `aria-*`…). Trong form react-hook-form dùng `RadioGroupField`;
 * vài lựa chọn ngắn dạng nút liền nhau thì dùng `SegmentToggle`; nhiều lựa chọn dùng `Dropdown`.
 * Sửa giao diện: vòng → `RADIO_ROOT_CLASSES` · chấm → `RADIO_DOT_CLASSES` · nhãn → `RADIO_LABEL_CLASSES`
 * · khung nhãn → `RADIO_LABEL_WRAPPER_CLASSES` (rê nhãn = rê vòng).
 * Lưu ý: ring KHÔNG `ring-offset` (vành trắng ở dark) — docs/notes/components/inputs.md (mục Radio).
 *
 * @param props.label - Nhãn bên phải vòng tròn; bấm vào nhãn cũng chọn. Bỏ trống → chỉ vòng tròn (khi đó
 *   cần `aria-label`).
 * @param props.className - Class thêm cho vòng tròn (`<button role="radio">`), không phải khung nhãn.
 * @param props.ref - Trỏ tới `<button role="radio">` (React 19: `ref` là prop thường).
 *
 * @example
 * <RadioGroup className="flex gap-4" value={plan} onValueChange={setPlan}>
 *   <Radio label="Theo ngày" value="day" />
 *   <Radio label="Theo tuần" value="week" />
 *   <Radio disabled label="Theo quý" value="quarter" />
 * </RadioGroup>
 */
function Radio({ label, className, ...props }: RadioProps) {
  const ring = (
    <RadioGroupPrimitive.Item className={cn(RADIO_ROOT_CLASSES, className)} {...props}>
      <RadioGroupPrimitive.Indicator className="inline-flex items-center justify-center">
        <span className={RADIO_DOT_CLASSES} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );

  if (!label) return ring;

  return (
    <label className={RADIO_LABEL_WRAPPER_CLASSES}>
      {ring}
      <span className={RADIO_LABEL_CLASSES}>{label}</span>
    </label>
  );
}

/**
 * RadioGroup — khung nhóm của `Radio` (Radix RadioGroup.Root): giữ giá trị đang chọn, phím mũi tên đi giữa
 * các ô.
 *
 * Nhận mọi prop của Radix `RadioGroup.Root`: `value` / `defaultValue` / `onValueChange`, `name`, `disabled`,
 * `required`, `orientation`, `className` (bố cục: `flex gap-4`, `flex flex-col gap-2`).
 *
 * @example
 * <RadioGroup className="flex flex-col gap-2" defaultValue="week">
 *   <Radio label="Theo tuần" value="week" />
 * </RadioGroup>
 */
export const RadioGroup = RadioGroupPrimitive.Root;

export default Radio;
