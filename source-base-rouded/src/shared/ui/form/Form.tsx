import { useMemo } from 'react';
import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import ConfirmDialog from '@/shared/ui/overlays/dialog/confirm-dialog/ConfirmDialog';
import { cn } from '@/shared/utils/style/cn';
import { FormMetaProvider } from './form.context';
import FormItem from './FormItem';
import FormActions from './layout/FormActions';
import { useDirtyGuard } from './hooks/useDirtyGuard';
import { useFormDraft } from './hooks/useFormDraft';

/** Tuỳ chọn tự lưu nháp của `<Form>` — ý nghĩa từng khoá xem khối tài liệu của `useFormDraft`. */
export interface AutoSaveOptions {
  key: string;
  debounceMs?: number;
  fields?: readonly string[];
  version?: number;
  maxAgeMs?: number;
}

export interface DirtyGuardOptions {
  message?: string;
}

export interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  readOnly?: boolean;

  autoSave?: AutoSaveOptions;
  dirtyGuard?: boolean | DirtyGuardOptions;
  className?: string;
}

const FORM_CLASSES = 'flex flex-col gap-4';

const FORM_ERROR_CLASSES = cn(
  'flex items-start gap-1.5 rounded-md px-3 py-2',
  'border border-error/30 bg-error/10 text-caption-12 text-error',
  'animate-chip-in motion-reduce:animate-none',
);

const DIRTY_GUARD_MESSAGE = 'Bạn có thay đổi chưa lưu. Rời đi sẽ mất dữ liệu.';

/**
 * FormError — dòng lỗi chung của cả form (`Form.Error`), vd `rootError` của `useServerErrors`.
 *
 * Không có `message` thì không render gì. Lỗi của từng ô do field tự hiện, không dùng ở đây.
 * Sửa giao diện: khối lỗi (viền + nền đỏ nhạt + icon) → `FORM_ERROR_CLASSES`.
 *
 * @param props.message - Câu lỗi; rỗng / `undefined` → ẩn.
 *
 * @example
 * <Form.Error message={rootError} />
 */
function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={FORM_ERROR_CLASSES} role="alert">
      <SystemIcon aria-hidden className="mt-0.5" name="circle-exclamation-outline" size={12} />
      <span>{message}</span>
    </p>
  );
}

/**
 * FormInner — ruột của `Form`: gắn nháp, chặn rời trang, provider và `<form>`; `Form` gắn thêm `Item` /
 * `Actions` / `Error` lên chính hàm này. Props và ý nghĩa: xem khối tài liệu của `Form` bên dưới.
 *
 * @example
 * <FormInner form={form} onSubmit={save} dirtyGuard>…</FormInner>
 */
function FormInner<T extends FieldValues>({
  form,
  onSubmit,
  children,
  readOnly = false,
  autoSave,
  dirtyGuard,
  className,
}: FormProps<T>) {
  const hasAutoSave = Boolean(autoSave);
  const dirtyEnabled = Boolean(dirtyGuard);
  const dirtyMessage = typeof dirtyGuard === 'object' ? dirtyGuard.message : undefined;
  const { clear: clearDraft } = useFormDraft({
    key: autoSave?.key ?? '',
    form,
    enabled: hasAutoSave,
    debounceMs: autoSave?.debounceMs,
    fields: autoSave?.fields as readonly (keyof T & string)[] | undefined,
    version: autoSave?.version,
    maxAgeMs: autoSave?.maxAgeMs,
  });
  const { isBlocked, proceed, cancel } = useDirtyGuard({ form, enabled: dirtyEnabled });
  const meta = useMemo(() => ({ readOnly, autoSave: hasAutoSave }), [readOnly, hasAutoSave]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      if (autoSave) clearDraft();
    } catch (err) {
      console.error('[Form] onSubmit ném lỗi:', err);
    }
  });

  return (
    <FormProvider {...form}>
      <FormMetaProvider value={meta}>
        <form className={cn(FORM_CLASSES, className)} noValidate onSubmit={handleSubmit}>
          {children}
        </form>

        {dirtyEnabled && (
          <ConfirmDialog
            actionLabel="Rời đi"
            cancelLabel="Ở lại"
            description={dirtyMessage ?? DIRTY_GUARD_MESSAGE}
            open={isBlocked}
            title="Bỏ thay đổi?"
            variant="warning"
            onCancel={cancel}
            onConfirm={proceed}
            onOpenChange={(open) => !open && cancel()}
          />
        )}
      </FormMetaProvider>
    </FormProvider>
  );
}

/**
 * Form — khung form của UI kit: nối react-hook-form cho mọi field bên trong, gửi qua `handleSubmit`, tuỳ
 * chọn tự lưu nháp và hỏi lại khi rời trang lúc còn thay đổi chưa lưu.
 *
 * Mọi field UI kit (`TextField`, `SelectField`…) phải nằm trong `<Form>`. Gắn sẵn: `Form.Item` (= `FormItem`),
 * `Form.Actions` (= `FormActions`), `Form.Error` (dòng lỗi chung, vd `rootError` của `useServerErrors`).
 * Form trong modal → `FormModal`; nhiều bước → `FormStepper`; chia tab → `FormTabs` đặt trong `<Form>`.
 * Sửa giao diện: khe giữa các khối → `FORM_CLASSES` · dòng lỗi chung (`Form.Error`) → `FORM_ERROR_CLASSES`.
 * Lưu ý: `<Form>` luôn gọi `useBlocker` nên phải nằm trong data router (`createBrowserRouter` /
 * `createMemoryRouter` trong test), kể cả khi không bật `dirtyGuard`.
 * `onSubmit` ném lỗi thì chỉ `console.error` — màn hình tự hiện lỗi nghiệp vụ (vd `useServerErrors`).
 *
 * @param props.form - Kết quả `useZodForm()` / `useForm()`.
 * @param props.onSubmit - Gọi với giá trị đã qua kiểm; trả Promise thì `formState.isSubmitting` bật tới
 *   khi xong. Xong không lỗi thì nháp của `autoSave` bị xoá.
 * @param props.children - Field, layout (`FormGrid`, `FormSection`…) và `Form.Actions`.
 * @param props.readOnly - `true` → mọi field UI kit bên trong hiện dạng chữ, không có ô nhập. Mặc định `false`.
 * @param props.autoSave - `{ key, debounceMs?, fields?, version?, maxAgeMs? }` → tự lưu nháp vào
 *   localStorage và khôi phục khi mở lại (xem `useFormDraft`). `key` phải riêng từng người dùng + bản ghi;
 *   form có mật khẩu / OTP phải khai `fields`. Bỏ trống = tắt.
 * @param props.dirtyGuard - `true` hoặc `{ message }` → hỏi xác nhận khi chuyển trang lúc form còn thay đổi
 *   chưa lưu. Mặc định tắt.
 * @param props.className - Class cho thẻ `<form>` (mặc định `flex flex-col gap-4`).
 *
 * @example
 * <Form form={form} onSubmit={save} dirtyGuard>
 *   <TextField name="name" label="Tên" required />
 *   <Form.Error message={rootError} />
 *   <Form.Actions isSubmitting={form.formState.isSubmitting} onCancel={close} />
 * </Form>
 *
 * <Form form={form} onSubmit={save} autoSave={{ key: `project-edit:${userId}:${projectId}` }}>…</Form>
 */
const Form = Object.assign(FormInner, {
  Item: FormItem,
  Actions: FormActions,
  Error: FormError,
});

export default Form;
