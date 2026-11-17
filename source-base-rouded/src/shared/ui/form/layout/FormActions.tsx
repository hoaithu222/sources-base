import Button from '@/shared/ui/actions/Button';
import { cn } from '@/shared/utils/style/cn';

export interface FormActionsProps {
  children?: React.ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  sticky?: boolean;
  className?: string;
}

const FORM_ACTIONS_BASE_CLASSES = 'flex flex-wrap items-center justify-end gap-3 pt-4';

/** Dải nút dính đáy: viền trên `divider-default`, nền mờ, bóng nhẹ hắt lên nội dung cuộn phía dưới. */
const FORM_ACTIONS_STICKY_CLASSES = cn(
  'sticky bottom-0 z-10 mt-auto py-4 pb-[calc(1rem+var(--safe-b,0px))]',
  'border-t border-divider-default',
  'bg-bg-surface/90 backdrop-blur-sm',
  'shadow-[0_-6px_16px_color-mix(in_srgb,var(--color-shadow-popup)_60%,transparent)]',
);

/**
 * FormActions — hàng nút cuối form: "Hủy bỏ" (khi có `onCancel`) + nút gửi `type="submit"`.
 *
 * Đặt cuối `<Form>` (hoặc `Form.Actions`); truyền `children` để thay cả hàng bằng nút riêng. Form trong
 * modal → footer của `FormModal`, không dùng FormActions.
 * Sửa giao diện: hàng nút → `FORM_ACTIONS_BASE_CLASSES` · dính đáy → `FORM_ACTIONS_STICKY_CLASSES`.
 * Lưu ý: nút cỡ `md` (h-9) để khớp footer `FormModal` (`buttonSize` mặc định `md`). `sticky` dính đáy KHUNG
 * CUỘN gần nhất — cha phải là vùng cuộn (`overflow-y-auto`) có chiều cao.
 *
 * @param props.children - Nội dung thay cho hai nút mặc định.
 * @param props.onCancel - Bấm "Hủy bỏ"; bỏ trống thì không có nút hủy.
 * @param props.cancelLabel - Chữ nút hủy. Mặc định `Hủy bỏ`.
 * @param props.submitLabel - Chữ nút gửi. Mặc định `Xác nhận`.
 * @param props.isSubmitting - `true` → nút gửi hiện spinner và bị khoá (truyền `formState.isSubmitting`).
 *   Mặc định `false`.
 * @param props.sticky - `true` → hàng nút dính đáy vùng cuộn, có viền trên + nền mờ, đáy cộng `--safe-b` (vạch
 *   Home) nên nơi bọc KHÔNG tự đệm thêm cho nó. Mặc định `false`.
 * @param props.className - Class cho hàng nút (ghi đè căn lề, khoảng cách).
 *
 * @example
 * <FormActions isSubmitting={form.formState.isSubmitting} sticky onCancel={close} />
 *
 * <FormActions>
 *   <Button type="submit">Lưu nháp</Button>
 * </FormActions>
 */
function FormActions({
  children,
  onCancel,
  cancelLabel = 'Hủy bỏ',
  submitLabel = 'Xác nhận',
  isSubmitting = false,
  sticky = false,
  className,
}: FormActionsProps) {
  const actionsClassName = cn(
    FORM_ACTIONS_BASE_CLASSES,
    sticky && FORM_ACTIONS_STICKY_CLASSES,
    className,
  );

  return (
    <div className={actionsClassName}>
      {children ?? (
        <>
          {onCancel && (
            <Button size="md" skin="neutral" type="button" variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button loading={isSubmitting} size="md" type="submit">
            {submitLabel}
          </Button>
        </>
      )}
    </div>
  );
}

export default FormActions;
