import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useEffect, useId, useRef, useState } from 'react';
import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form';
import { useLatestRequest } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import Button from '@/shared/ui/actions/Button';
import type { ButtonSize } from '@/shared/ui/actions/button.types';
import { FormMetaProvider } from '@/shared/ui/form/form.context';
import CustomModalLayout from './CustomModalLayout';
import { MODAL_OVERLAY_CLASS, MODAL_SLOT_CLASSES } from '../modal.theme';
import { useOpenAutoFocus } from './useOpenAutoFocus';

export type FormModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface FormModalProps<T extends FieldValues = FieldValues> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  children?: React.ReactNode;
  size?: FormModalSize;
  buttonSize?: ButtonSize;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: (data?: T) => void | Promise<void>;
  extraActions?: React.ReactNode;
  scrollable?: boolean;
  fitHeight?: boolean;
  trigger?: React.ReactNode;
  className?: string;
  form?: UseFormReturn<T>;
  readOnly?: boolean;
  confirmDisabled?: boolean;
  hideDefaultFooter?: boolean;
  autoFocusFirst?: boolean;
  onOpenAutoFocus?: (event: Event) => void;
}

const FORM_MODAL_SIZE_CLASSES = {
  sm: 'w-[560px]',
  md: 'w-[800px]',
  lg: 'w-[960px]',
  xl: 'w-[1200px]',
} satisfies Record<FormModalSize, string>;

const FORM_MODAL_PANEL_CLASSES = 'max-h-[90dvh]';
const FORM_MODAL_BODY_CLASSES = 'min-h-0 px-5 py-4';
const FORM_MODAL_BODY_FLOW_CLASSES =
  'overflow-visible max-lg:overflow-y-auto touch:overflow-y-auto';
const FORM_MODAL_FOOTER_CLASSES =
  'flex w-full items-center justify-between gap-4 phone:flex-col phone:items-stretch phone:gap-2';
const FORM_MODAL_ACTIONS_CLASSES =
  'flex items-center gap-4 phone:empty:hidden phone:flex-wrap phone:gap-2';
const FORM_MODAL_BUTTONS_CLASSES = 'flex items-center gap-2';
/** Nút Huỷ / Lưu: sáng dạng viên `rounded-2xl` ≥ 96px như sheet macOS (đồng bộ footer `Modal`); điện thoại chia đôi bề ngang. */
const FORM_MODAL_BUTTON_CLASSES = 'min-w-24 rounded-2xl phone:flex-1';

function bodyOverflowClassName(fitHeight: boolean, scrollable: boolean): string {
  if (fitHeight) return 'overflow-hidden';
  return scrollable ? 'overflow-y-auto' : FORM_MODAL_BODY_FLOW_CLASSES;
}

/**
 * FormModal — modal nhập liệu: khung `CustomModalLayout` trên Radix Dialog, tuỳ chọn nối sẵn
 * react-hook-form qua `form`. Xem / thông báo thì dùng `Modal`; hỏi "chắc chưa?" thì dùng `ConfirmDialog`.
 *
 * Có `form`: children được bọc `FormProvider` + `<form>`, nút xác nhận là nút submit của form
 * (`form.handleSubmit(onConfirm)`) — field UI kit đặt thẳng bên trong, không cần bọc `<Form>`.
 * Hai chế độ: controlled (`open` + `onOpenChange`) hoặc uncontrolled (`trigger` / `defaultOpen` — ✕ / Huỷ /
 * lưu xong vẫn tự đóng, không cần `onOpenChange`).
 * `onConfirm` chạy xong → tự đóng; ném lỗi → giữ mở (API có chủ đích — docs/rules/data/form-validation.md §4).
 * Đang chờ `onConfirm` thì nút xác nhận khoá (không gửi đúp); đóng rồi mở lại thì kết quả về muộn của
 * lượt cũ bị bỏ, không đóng modal mới (docs/rules/data/async-safety.md).
 * Tablet / điện thoại: form dài hơn màn thì THÂN cuộn (header + footer đứng yên); điện thoại: panel gần toàn màn,
 * nút phụ (`extraActions`) xếp trên, Huỷ / Xác nhận chia đôi bề ngang.
 * Sửa giao diện: bề rộng → `FORM_MODAL_SIZE_CLASSES` · khung → `overlays/modal.theme.ts`.
 * Lưu ý: thang `size` RỘNG HƠN Modal (md 800px ở đây, 520px ở đó) — đổi qua lại phải đổi `size`.
 * chiều cao luôn `dvh` KHÔNG `vh` (ipad-responsive.md §5); body KHÔNG `[scrollbar-gutter:stable]`
 * — notes/components/overlays.md#formmodal. Panel chặn nổi bọt như Modal (FormModal lồng nhau không
 * submit nhầm form ngoài). Figma: PMS-NEW 1644-77325.
 *
 * @param props.open - Trạng thái mở (controlled). Bỏ trống → uncontrolled.
 * @param props.defaultOpen - Mở sẵn lúc mount (uncontrolled). Mặc định `false`.
 * @param props.onOpenChange - Gọi khi mở / đóng: Huỷ, ✕, Esc, bấm nền, `onConfirm` chạy xong.
 * @param props.title - Tiêu đề (bắt buộc); hiện nguyên chữ hoa / thường và chính nó là `Dialog.Title`
 *   (tên truy cập của modal).
 * @param props.children - Nội dung body (các field).
 * @param props.size - Bề rộng: `sm` 560 · `md` 800 · `lg` 960 · `xl` 1200 (px). Mặc định `md`.
 * @param props.buttonSize - Cỡ hai nút footer: `xl` | `lg` | `md` | `sm` | `xs`. Mặc định `md`.
 * @param props.cancelLabel - Nhãn nút huỷ. Mặc định `'Hủy bỏ'`.
 * @param props.confirmLabel - Nhãn nút xác nhận; đang gửi thì hiện "Đang xử lý...". Mặc định `'Xác nhận'`.
 * @param props.onCancel - Gọi khi bấm Huỷ, rồi modal tự đóng (✕ / Esc không gọi).
 * @param props.onConfirm - Bấm xác nhận. Có `form` → nhận dữ liệu đã validate. Trả promise → nút khoá tới
 *   khi xong; xong thì đóng, ném lỗi thì giữ mở.
 * @param props.extraActions - Node phụ bên trái footer (vd nút "Lưu nháp").
 * @param props.scrollable - `true` → body tự cuộn dọc; `false` → nội dung tràn tự do. Mặc định `false`.
 * @param props.fitHeight - Body + form lấp đầy chiều cao modal, con tự quản cuộn; ghép với `className`
 *   cao cố định (vd `h-[90dvh]`). Thắng `scrollable`. Mặc định `false`.
 * @param props.trigger - Phần tử mở modal (chế độ uncontrolled), vd một `<Button>`.
 * @param props.className - Class thêm cho panel.
 * @param props.form - `UseFormReturn` của react-hook-form (`useZodForm` / `useForm`); có → bọc
 *   `FormProvider` + `<form>` và nút xác nhận thành nút submit.
 * @param props.readOnly - Đưa field vào chế độ chỉ đọc qua `FormMetaProvider` (chỉ khi có `form`).
 *   Mặc định `false`.
 * @param props.confirmDisabled - Khoá nút xác nhận. Mặc định `false`.
 * @param props.hideDefaultFooter - Ẩn cặp nút mặc định; `extraActions` chiếm trọn bề ngang footer.
 *   Mặc định `false`.
 * @param props.autoFocusFirst - Focus ô nhập đầu tiên trong `<form>` khi mở; `data-autofocus="true"` được
 *   ưu tiên, `data-modal-autofocus-skip="true"` bị bỏ qua. Mặc định `true`.
 * @param props.onOpenAutoFocus - Ghi đè auto-focus của Radix (`e.preventDefault()` rồi tự focus); thắng
 *   `autoFocusFirst`.
 *
 * @example
 * const form = useZodForm<ItemValues>(itemSchema, { defaultValues: { name: '' } });
 *
 * <FormModal form={form} open={open} onOpenChange={setOpen} title="Thêm hạng mục" onConfirm={save}>
 *   <TextField label="Tên hạng mục" name="name" />
 * </FormModal>
 */
function FormModal<T extends FieldValues = FieldValues>({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  children,
  size = 'md',
  buttonSize = 'md',
  cancelLabel = 'Hủy bỏ',
  confirmLabel = 'Xác nhận',
  onCancel,
  onConfirm,
  scrollable = false,
  fitHeight = false,
  trigger,
  className,
  form,
  readOnly = false,
  confirmDisabled = false,
  extraActions,
  hideDefaultFooter = false,
  autoFocusFirst = true,
  onOpenAutoFocus,
}: FormModalProps<T>) {
  const formId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const pendingSubmit = useRef<(() => boolean) | null>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [submitting, setSubmitting] = useState(false);
  const isOpen = open ?? innerOpen;
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const { begin, invalidate } = useLatestRequest();
  const handleOpenAutoFocus = useOpenAutoFocus(contentRef, {
    enabled: autoFocusFirst,
    onOpenAutoFocus,
    preferForm: true,
  });

  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) setSubmitting(false);
  }

  const isSubmitting = submitting || (form?.formState.isSubmitting ?? false);

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const submit = async (run: () => Promise<void> | void) => {
    if (pendingSubmit.current?.()) return;
    const isCurrent = begin();
    pendingSubmit.current = isCurrent;
    setSubmitting(true);
    try {
      await run();
      if (isCurrent()) setOpen(false);
    } catch (err) {
      console.error('[FormModal] onConfirm ném lỗi — giữ modal mở:', err);
    } finally {
      if (pendingSubmit.current === isCurrent) pendingSubmit.current = null;
      if (isCurrent()) setSubmitting(false);
    }
  };

  const handleConfirm = (event?: React.BaseSyntheticEvent) => {
    if (!form) return submit(() => onConfirm?.());
    return form.handleSubmit((data) => submit(() => onConfirm?.(data)))(event);
  };

  useEffect(() => {
    if (!isOpen) invalidate();
  }, [isOpen, invalidate]);

  const panelClassName = cn(
    MODAL_SLOT_CLASSES.panel,
    FORM_MODAL_PANEL_CLASSES,
    FORM_MODAL_SIZE_CLASSES[size],
    className,
  );
  const bodyClassName = cn(FORM_MODAL_BODY_CLASSES, bodyOverflowClassName(fitHeight, scrollable));
  const extraActionsClassName = cn(FORM_MODAL_ACTIONS_CLASSES, hideDefaultFooter && 'w-full');
  const formClassName = cn(
    'flex flex-col gap-4',
    fitHeight && 'min-h-0 flex-1 overflow-hidden h-full',
  );

  const footerContent = (
    <div className={FORM_MODAL_FOOTER_CLASSES} data-modal-footer="true">
      <div className={extraActionsClassName}>{extraActions}</div>
      {!hideDefaultFooter && (
        <div className={FORM_MODAL_BUTTONS_CLASSES}>
          <Button
            className={FORM_MODAL_BUTTON_CLASSES}
            size={buttonSize}
            skin="neutral"
            type="button"
            variant="secondary"
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={FORM_MODAL_BUTTON_CLASSES}
            disabled={confirmDisabled || isSubmitting}
            form={form ? formId : undefined}
            loading={isSubmitting}
            size={buttonSize}
            type={form ? 'submit' : 'button'}
            variant="primary"
            onClick={form ? undefined : handleConfirm}
          >
            {isSubmitting ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </div>
      )}
    </div>
  );

  const bodyContent = form ? (
    <FormProvider {...form}>
      <FormMetaProvider value={{ readOnly, autoSave: false }}>
        <form className={formClassName} id={formId} noValidate onSubmit={handleConfirm}>
          {children}
        </form>
      </FormMetaProvider>
    </FormProvider>
  ) : (
    children
  );

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={MODAL_OVERLAY_CLASS} />

        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          className={panelClassName}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onOpenAutoFocus={handleOpenAutoFocus}
          onPointerDown={(e) => e.stopPropagation()}
          onSubmit={(e) => e.stopPropagation()}
        >
          <CustomModalLayout
            bodyClassName={bodyClassName}
            className="min-h-0 flex-1"
            footer={footerContent}
            title={
              <DialogPrimitive.Title asChild>
                <span>{title}</span>
              </DialogPrimitive.Title>
            }
            onClose={() => setOpen(false)}
          >
            {bodyContent}
          </CustomModalLayout>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default FormModal;
