import { useState, useMemo } from 'react';
import { get, useFormState } from 'react-hook-form';
import type { UseFormReturn, FieldErrors, FieldValues, FieldPath } from 'react-hook-form';
import Button from '@/shared/ui/actions/Button';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Stepper, {
  type StepItem,
  type StepperLayout,
  type StepperSize,
} from '@/shared/ui/navigation/Stepper';
import { useEventCallback, useLatestRequest } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';

export interface FormStep<T extends FieldValues> {
  /** Tên bước, hiện trên thanh tiến trình. */
  title: string;
  /** Tên các field của bước này; chỉ những field này được validate khi bấm Tiếp theo. */
  fields: FieldPath<T>[];
  /** Nội dung (các field) của bước. */
  component: React.ReactNode;
  /** Key ổn định cho Stepper; bỏ trống thì dùng `<chỉ số>-<title>`. */
  key?: string;
}

export interface FormStepperProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  steps: FormStep<T>[];
  className?: string;
  stepperLayout?: StepperLayout;
  stepperSize?: StepperSize;
  stepperClassName?: string;
  hideHeader?: boolean;
  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
}

const FORM_STEPPER_ROOT_CLASSES = 'flex flex-col gap-4';

const FORM_STEPPER_BODY_CLASSES = 'flex flex-col gap-4 animate-chip-in motion-reduce:animate-none';

/** Hàng nút: vạch ngăn trên `divider-default`, như `Toolbar border="top"`. */
const FORM_STEPPER_FOOTER_CLASSES =
  'flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-divider-default';

const FORM_STEPPER_COUNTER_CLASSES = 'text-caption-12 text-fg-muted tabular-nums';

const NON_TEXT_INPUT_TYPES = /^(checkbox|radio|file|button|submit|reset|image|range|color)$/;

function stepHasError<T extends FieldValues>(step: FormStep<T>, errors: FieldErrors<T>): boolean {
  return step.fields.some((name) => get(errors, name) !== undefined);
}

/** Enter trong ô gõ chữ — đúng chỗ trình duyệt sẽ tự gửi `<form>` bao ngoài. */
function isImplicitSubmit(event: React.KeyboardEvent): boolean {
  const { target } = event;
  if (event.key !== 'Enter' || event.defaultPrevented || event.nativeEvent.isComposing)
    return false;
  return target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.test(target.type);
}

/**
 * FormStepper — form nhiều bước (wizard): thanh tiến trình + nội dung bước hiện tại + nút Quay lại /
 * Tiếp theo / Hoàn tất; mỗi lần "Tiếp theo" chỉ kiểm các field của bước đó.
 *
 * Đặt TRONG `<Form>` cùng `form` (các field của từng bước cần `FormProvider`). Nút "Hoàn tất" kiểm cả form
 * rồi gọi `onSubmit`; hỏng vì lỗi ở bước khác → tự quay về bước có lỗi đầu tiên. Bước đã qua mà còn lỗi
 * hiện trạng thái lỗi trên thanh tiến trình. Nhóm ngang hàng không cần thứ tự → `FormTabs`.
 * Sửa giao diện: khung → `FORM_STEPPER_ROOT_CLASSES` · thân bước (hiệu ứng chuyển) →
 * `FORM_STEPPER_BODY_CLASSES` · hàng nút → `FORM_STEPPER_FOOTER_CLASSES` · đếm bước →
 * `FORM_STEPPER_COUNTER_CLASSES`.
 * Lưu ý: chỉ bước hiện tại được render (giá trị các bước khác vẫn giữ) — lỗi của field ở bước trước chỉ hiện
 * khi quay lại bước đó, nên khai đủ `fields` cho từng bước. Bấm "Tiếp theo" liên tục khi đang kiểm chỉ sang
 * đúng một bước; bấm "Quay lại" khi đang kiểm thì kết quả kiểm bị bỏ. Enter trong ô nhập = "Tiếp theo"
 * (bước cuối = "Hoàn tất"), không gửi thẳng `<form>` bao ngoài.
 * `onSubmit` ném lỗi thì chỉ `console.error` — màn hình tự hiện lỗi nghiệp vụ.
 *
 * @param props.form - Kết quả `useZodForm()` / `useForm()` — cùng `form` truyền cho `<Form>`.
 * @param props.onSubmit - Gọi với giá trị đã qua kiểm khi bấm "Hoàn tất" ở bước cuối.
 * @param props.steps - Các bước `{ title, fields, component, key? }` (xem `FormStep`).
 * @param props.className - Class cho khối ngoài cùng.
 * @param props.stepperLayout - Bố cục thanh tiến trình: `horizontal-center` | `horizontal-inline` | `vertical`.
 *   Mặc định `horizontal-center`.
 * @param props.stepperSize - Cỡ thanh tiến trình: `sm` | `md`. Mặc định `md`.
 * @param props.stepperClassName - Class cho thanh tiến trình.
 * @param props.hideHeader - `true` → ẩn thanh tiến trình. Mặc định `false`.
 * @param props.nextLabel - Chữ nút sang bước sau. Mặc định `Tiếp theo`.
 * @param props.backLabel - Chữ nút quay lại. Mặc định `Quay lại`.
 * @param props.finishLabel - Chữ nút ở bước cuối. Mặc định `Hoàn tất`.
 *
 * @example
 * <Form form={form} onSubmit={save}>
 *   <FormStepper
 *     form={form}
 *     onSubmit={save}
 *     steps={[
 *       { title: 'Thông tin', fields: ['name'], component: <StepInfo /> },
 *       { title: 'Xác nhận', fields: [], component: <StepConfirm /> },
 *     ]}
 *   />
 * </Form>
 */
function FormStepper<T extends FieldValues>({
  form,
  onSubmit,
  steps,
  className,
  stepperLayout = 'horizontal-center',
  stepperSize = 'md',
  stepperClassName,
  hideHeader = false,
  nextLabel = 'Tiếp theo',
  backLabel = 'Quay lại',
  finishLabel = 'Hoàn tất',
}: FormStepperProps<T>) {
  const [current, setCurrent] = useState(0);
  const { errors, isSubmitting } = useFormState({ control: form.control });
  const { begin, invalidate } = useLatestRequest();
  const lastIndex = Math.max(steps.length - 1, 0);
  const activeIndex = Math.min(current, lastIndex);
  const isLast = activeIndex === lastIndex;

  const stepItems = useMemo<StepItem[]>(
    () =>
      steps.map((s, i) => ({
        key: s.key ?? `${i}-${s.title}`,
        label: s.title,
        status: i <= activeIndex && stepHasError(s, errors) ? 'error' : undefined,
      })),
    [steps, errors, activeIndex],
  );

  const handleNext = useEventCallback(async () => {
    const from = activeIndex;
    const isCurrent = begin();
    const stepFields = steps[from]?.fields ?? [];
    const valid = stepFields.length ? await form.trigger(stepFields) : true;
    if (!isCurrent() || !valid) return;
    setCurrent((c) => (c === from ? Math.min(from + 1, lastIndex) : c));
  });

  const handleBack = () => {
    invalidate();
    setCurrent(Math.max(activeIndex - 1, 0));
  };

  const handleInvalid = (invalid: FieldErrors<T>) => {
    const index = steps.findIndex((s) => stepHasError(s, invalid));
    if (index !== -1) setCurrent(index);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      console.error('[FormStepper] onSubmit ném lỗi:', err);
    }
  }, handleInvalid);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isImplicitSubmit(event)) return;
    event.preventDefault();
    void (isLast ? handleSubmit() : handleNext());
  };

  const stepperRootClassName = cn(FORM_STEPPER_ROOT_CLASSES, className);

  return (
    <div className={stepperRootClassName}>
      {!hideHeader && (
        <Stepper
          activeStep={activeIndex}
          className={stepperClassName}
          layout={stepperLayout}
          size={stepperSize}
          steps={stepItems}
        />
      )}

      <div key={activeIndex} className={FORM_STEPPER_BODY_CLASSES} onKeyDown={handleKeyDown}>
        {steps[activeIndex]?.component}
      </div>

      <div className={FORM_STEPPER_FOOTER_CLASSES}>
        <Button
          disabled={activeIndex === 0}
          size="md"
          skin="neutral"
          startIcon={<SystemIcon name="angle-left-outline" />}
          type="button"
          variant="secondary"
          onClick={handleBack}
        >
          {backLabel}
        </Button>

        <div className="flex items-center gap-3">
          <span className={FORM_STEPPER_COUNTER_CLASSES}>
            Bước {activeIndex + 1}/{steps.length}
          </span>
          {isLast ? (
            <Button
              loading={isSubmitting}
              size="md"
              startIcon={<SystemIcon name="check-outline" />}
              type="button"
              onClick={() => void handleSubmit()}
            >
              {finishLabel}
            </Button>
          ) : (
            <Button
              endIcon={<SystemIcon name="angle-right-outline" />}
              size="md"
              type="button"
              onClick={() => void handleNext()}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormStepper;
