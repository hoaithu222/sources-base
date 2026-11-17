import { memo, useCallback, useId, useState } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/shared/constants/paths.constants';

import {
  Badge,
  Button,
  ConfirmDialog,
  DateField,
  Form,
  FormActions,
  FormGrid,
  FormItem,
  FormSection,
  Input,
  Modal,
  TextField,
  useAsyncValidation,
  useDirtyGuard,
  useFormDraft,
  useModalDateDefaults,
  useServerErrors,
  useZodForm,
  showToast,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoRatingField from '../../components/showcase/DemoRatingField';
import DemoSection from '../../components/shell/DemoSection';
import { mockDelay } from '../../schemas/form-advanced.schema';
import {
  DEMO_HOOKS_DEFAULTS,
  DEMO_QUICK_DATE_DEFAULTS,
  demoHooksSchema,
  demoQuickDateSchema,
  type DemoHooksValues,
} from '../../schemas/form-hooks.schema';

/**
 * FormHooksSection — mục "Hook của form" của trang `/demo`.
 * Mỗi hook của hệ form chạy thật trên form nhỏ này: `useFormField`/`useFormMeta` qua RatingField · `useServerErrors`
 * gắn `note` · `useFormDraft`/`useDirtyGuard` gắn cả form · `useAsyncValidation` + `useModalDateDefaults` độc lập.
 */
const FormHooksSection = memo(function FormHooksSection() {
  const form = useZodForm<DemoHooksValues>(demoHooksSchema, {
    defaultValues: DEMO_HOOKS_DEFAULTS,
  });
  const { applyServerErrors, rootError } = useServerErrors(form);
  const { clear: clearDraft, hasDraft } = useFormDraft({ key: 'demo-form-hooks', form });
  const { isBlocked, proceed, cancel } = useDirtyGuard({ form });
  const { validate, isValidating, asyncError } = useAsyncValidation({
    fn: (v) => mockDelay(v.trim().toUpperCase() !== 'DEMO', 500),
    errorMessage: 'Mã đã tồn tại',
  });
  const codeId = useId();

  const [quickOpen, setQuickOpen] = useState(false);
  const quickForm = useZodForm(demoQuickDateSchema, { defaultValues: DEMO_QUICK_DATE_DEFAULTS });
  useModalDateDefaults({ form: quickForm, open: quickOpen, fields: ['quickDate'] });

  const handleSubmit = useCallback((v: DemoHooksValues) => {
    showToast('success', `Đã lưu ${Object.keys(v).length} field`);
  }, []);
  const handleServerError = useCallback(
    () => applyServerErrors({ response: { data: { note: 'Ghi chú trùng với bản ghi khác' } } }),
    [applyServerErrors],
  );

  return (
    <DemoSection
      description="useFormField/useFormMeta · useServerErrors · useFormDraft · useDirtyGuard · useAsyncValidation · useModalDateDefaults."
      importPath="@/shared/ui — hook hệ form"
      title="Hệ form — hook"
    >
      <Form form={form} onSubmit={handleSubmit}>
        <FormGrid cols={2}>
          <FormSection
            description="RatingField tự viết trên FormItem"
            title="useFormField + useFormMeta"
          >
            <TextField label="Ghi chú" name="note" required />
            <DemoRatingField />
          </FormSection>
          <FormSection description="Mô phỏng lỗi 422 gắn vào field Ghi chú" title="useServerErrors">
            <Button className="self-start" size="sm" variant="stroke" onClick={handleServerError}>
              Giả lập lỗi máy chủ
            </Button>
            <Form.Error message={rootError} />
          </FormSection>
          <FormSection description="Tự lưu localStorage, khôi phục khi mở lại" title="useFormDraft">
            <div className="flex items-center gap-2">
              <Badge color={hasDraft ? 'success' : 'neutral'} dot size="sm" variant="tinted">
                {hasDraft ? 'Có bản nháp' : 'Chưa có nháp'}
              </Badge>
              <Button size="sm" skin="neutral" variant="stroke" onClick={clearDraft}>
                Xoá bản nháp
              </Button>
            </div>
          </FormSection>
          <FormSection
            description="Sửa Ghi chú rồi bấm để thấy chặn điều hướng"
            title="useDirtyGuard"
          >
            <Button asChild className="self-start" size="sm" variant="stroke">
              <Link to={PATHS.HOME}>Về trang chủ</Link>
            </Button>
            <ConfirmDialog
              actionLabel="Rời khỏi"
              cancelLabel="Ở lại"
              description="Form còn thay đổi chưa lưu — rời trang sẽ mất dữ liệu."
              open={isBlocked}
              title="Rời khỏi trang?"
              variant="warning"
              onConfirm={proceed}
              onOpenChange={(next) => !next && cancel()}
            />
          </FormSection>
        </FormGrid>
        <FormActions isSubmitting={form.formState.isSubmitting} submitLabel="Lưu" />
      </Form>

      <FormGrid cols={2}>
        <FormSection
          description="Gõ 'DEMO' rồi rời ô để thấy lỗi trùng mã"
          title="useAsyncValidation"
        >
          <FormItem error={asyncError} htmlFor={codeId} label="Mã dự án">
            <Input
              defaultValue=""
              endIcon={
                isValidating ? (
                  <SystemIcon className="animate-spin" name="arrows-rotate-outline" size={14} />
                ) : undefined
              }
              id={codeId}
              invalid={Boolean(asyncError)}
              placeholder="VD: DA-2024-01"
              onBlur={(e) => validate(e.target.value)}
            />
          </FormItem>
        </FormSection>
        <FormSection
          description="Mở modal — ngày tự điền hôm nay nếu trống"
          title="useModalDateDefaults"
        >
          <Modal
            open={quickOpen}
            title="Thêm nhanh"
            trigger={
              <Button className="self-start" size="sm" variant="stroke">
                Mở modal
              </Button>
            }
            onOpenChange={setQuickOpen}
          >
            <Form form={quickForm} onSubmit={() => setQuickOpen(false)}>
              <DateField label="Ngày thực hiện" name="quickDate" required />
              <FormActions submitLabel="Thêm" onCancel={() => setQuickOpen(false)} />
            </Form>
          </Modal>
        </FormSection>
      </FormGrid>
    </DemoSection>
  );
});

export default FormHooksSection;
