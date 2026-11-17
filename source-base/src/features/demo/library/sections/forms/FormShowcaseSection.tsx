import { memo, useCallback, useState } from 'react';

import {
  Callout,
  CheckboxField,
  DateField,
  EmailField,
  Form,
  FormActions,
  FormGrid,
  FormSection,
  MultiSelectField,
  NumberField,
  PasswordField,
  RadioGroupField,
  SelectField,
  Text,
  TextField,
  TextareaField,
  ToggleField,
  useZodForm,
  showToast,
} from '@/shared/ui';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_DROPDOWN_OPTIONS, DEMO_MULTISELECT_OPTIONS } from '../../constants/samples.constants';
import {
  DEMO_FORM_DEFAULTS,
  DEMO_PRIORITY_OPTIONS,
  demoFormSchema,
  type DemoFormValues,
} from '../../schemas/form-showcase.schema';

/**
 * FormShowcaseSection — mục "Hệ form" của trang `/demo`: các field cơ bản nối sẵn react-hook-form + Zod.
 */
const FormShowcaseSection = memo(function FormShowcaseSection() {
  const [submitted, setSubmitted] = useState<DemoFormValues | null>(null);
  const form = useZodForm<DemoFormValues>(demoFormSchema, {
    defaultValues: DEMO_FORM_DEFAULTS,
  });

  const handleSubmit = useCallback((values: DemoFormValues) => {
    setSubmitted(values);
    showToast('success', 'Dữ liệu hợp lệ — xem kết quả bên dưới');
  }, []);

  const handleReset = useCallback(() => {
    form.reset(DEMO_FORM_DEFAULTS);
    setSubmitted(null);
  }, [form]);

  return (
    <DemoSection
      description="Field nối sẵn react-hook-form + Zod. Bấm Lưu khi còn ô trống để xem cách báo lỗi."
      importPath="@/shared/ui — useZodForm, *Field"
      title="Hệ form"
    >
      <Callout intent="info" title="Ô chữ bắt buộc phải .trim() trước .min(1)" variant="tinted">
        Thiếu <code className="font-mono">.trim()</code> thì một chuỗi toàn dấu cách vẫn qua được
        kiểm tra — form gửi đi cái tên rỗng mà không báo gì.
      </Callout>

      <Form form={form} onSubmit={handleSubmit}>
        <FormSection
          description="Thông tin định danh và tài khoản liên hệ của hạng mục."
          title="Thông tin chung"
        >
          <FormGrid cols={2}>
            <TextField
              description="Tối đa 20 ký tự, viết liền không dấu."
              label="Mã hạng mục"
              maxLength={20}
              name="code"
              required
            />
            <TextField label="Tên hạng mục" maxLength={120} name="name" required />
            <EmailField label="Email liên hệ" name="email" required />
            <PasswordField label="Mật khẩu" name="password" required showStrength />
          </FormGrid>
        </FormSection>

        <FormSection
          description="Đơn vị, khối lượng và kỳ thực hiện."
          title="Khối lượng & thời gian"
        >
          <FormGrid cols={2}>
            <SelectField
              label="Đơn vị tính"
              name="unit"
              options={DEMO_DROPDOWN_OPTIONS}
              required
              searchable
            />
            <NumberField clearable label="Khối lượng" min={0} name="quantity" required />
            <DateField label="Ngày bắt đầu" name="startDate" required />
            <DateField label="Ngày kết thúc" name="endDate" required />
            <MultiSelectField
              label="Bộ môn"
              name="trades"
              options={DEMO_MULTISELECT_OPTIONS}
              required
              searchable
            />
            <RadioGroupField
              label="Mức ưu tiên"
              name="priority"
              options={DEMO_PRIORITY_OPTIONS}
              orientation="horizontal"
              required
            />
          </FormGrid>
        </FormSection>

        <FormSection
          collapsible
          defaultOpen={false}
          description="Bấm tiêu đề để mở — thân gập lại được, giá trị vẫn giữ."
          title="Tuỳ chọn thêm"
        >
          <FormGrid cols={2}>
            <TextareaField label="Ghi chú" maxLength={500} name="note" rows={3} showCount />
            <div className="flex flex-col gap-4">
              <ToggleField
                label="Nhận thông báo"
                name="notify"
                toggleLabel="Gửi email khi có thay đổi"
              />
              <CheckboxField checkboxLabel="Tôi đồng ý với điều khoản" name="accept" required />
            </div>
          </FormGrid>
        </FormSection>

        <FormActions
          cancelLabel="Đặt lại"
          isSubmitting={form.formState.isSubmitting}
          submitLabel="Lưu"
          onCancel={handleReset}
        />
      </Form>

      {submitted ? (
        <DemoRow label="Dữ liệu đã gửi" stacked>
          <pre className="max-h-56 overflow-auto border border-border-default bg-bg-subtle p-2 font-mono text-caption-12 text-fg-subheading tabular-nums">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </DemoRow>
      ) : null}

      <Text size="extraTiny" skin="muted">
        Còn có <code className="font-mono">FieldArray</code>,{' '}
        <code className="font-mono">FormStepper</code>,{' '}
        <code className="font-mono">ConditionalField</code>,{' '}
        <code className="font-mono">useFormDraft</code> và{' '}
        <code className="font-mono">useDirtyGuard</code> cho form nhiều bước hoặc form dài.
      </Text>
    </DemoSection>
  );
});

export default FormShowcaseSection;
