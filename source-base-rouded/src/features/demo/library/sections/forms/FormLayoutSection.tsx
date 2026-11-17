import { memo, useCallback, useMemo } from 'react';
import type { FieldPath } from 'react-hook-form';

import {
  Badge,
  CheckboxField,
  FIELD_HEIGHT,
  Form,
  FormActions,
  FormGrid,
  FormItem,
  FormRow,
  FormSection,
  FormStepper,
  FormTabs,
  Input,
  Text,
  TextField,
  useZodForm,
  showToast,
} from '@/shared/ui';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_GRID_COLS,
  DEMO_STEPPER_DEFAULTS,
  DEMO_STICKY_LINES,
  DEMO_TABS_DEFAULTS,
  ERROR_COLOR_DEMO,
  demoStepperSchema,
  demoTabsSchema,
  type DemoStepperValues,
  type DemoTabsValues,
} from '../../schemas/form-layout.schema';

type StepperField = FieldPath<DemoStepperValues>;

/**
 * FormLayoutSection — mục "Bố cục form" của trang `/demo`: `FormTabs` · `FormStepper` · `FormGrid` · `FormRow` · `FormSection` · `FormActions`.
 */
const FormLayoutSection = memo(function FormLayoutSection() {
  const tabsForm = useZodForm<DemoTabsValues>(demoTabsSchema, {
    defaultValues: DEMO_TABS_DEFAULTS,
  });
  const stepperForm = useZodForm<DemoStepperValues>(demoStepperSchema, {
    defaultValues: DEMO_STEPPER_DEFAULTS,
  });

  const handleTabsSubmit = useCallback((v: DemoTabsValues) => {
    showToast('success', `Đã gửi ${v.fullName}`);
  }, []);
  const handleStepperSubmit = useCallback((v: DemoStepperValues) => {
    showToast('success', `Hoàn tất — ${v.stepName}, ${v.stepCity}`);
  }, []);
  const stepperSteps = useMemo(
    () => [
      {
        title: 'Thông tin',
        fields: ['stepName', 'stepEmail'] as StepperField[],
        component: (
          <FormGrid cols={2}>
            <TextField label="Họ tên" name="stepName" required />
            <TextField label="Email" name="stepEmail" required type="email" />
          </FormGrid>
        ),
      },
      {
        title: 'Địa chỉ',
        fields: ['stepAddress', 'stepCity'] as StepperField[],
        component: (
          <FormGrid cols={2}>
            <TextField label="Địa chỉ" name="stepAddress" required />
            <TextField label="Tỉnh/thành" name="stepCity" required />
          </FormGrid>
        ),
      },
      {
        title: 'Xác nhận',
        fields: ['stepAgree'] as StepperField[],
        component: (
          <CheckboxField checkboxLabel="Xác nhận thông tin ở trên" name="stepAgree" required />
        ),
      },
    ],
    [],
  );

  return (
    <DemoSection
      description="FormTabs · FormStepper · FormItem/FormGrid/FormRow/FormSection/FormActions."
      importPath="@/shared/ui — bố cục form"
      title="Hệ form — bố cục"
    >
      <DemoRow label="FormTabs — badge lỗi theo tab (bấm Gửi khi trống)" stacked>
        <Form form={tabsForm} onSubmit={handleTabsSubmit}>
          <FormTabs form={tabsForm}>
            <FormTabs.Panel fields={['fullName', 'email']} label="Cá nhân" value="personal">
              <FormGrid cols={2}>
                <TextField label="Họ tên" name="fullName" required />
                <TextField label="Email" name="email" required type="email" />
              </FormGrid>
            </FormTabs.Panel>
            <FormTabs.Panel fields={['companyName', 'taxId']} label="Doanh nghiệp" value="business">
              <FormGrid cols={2}>
                <TextField label="Tên công ty" name="companyName" required />
                <TextField label="Mã số thuế" name="taxId" required />
              </FormGrid>
            </FormTabs.Panel>
          </FormTabs>
          <FormActions isSubmitting={tabsForm.formState.isSubmitting} submitLabel="Gửi" />
        </Form>
      </DemoRow>

      <DemoRow label="FormStepper — validate từng bước · Enter = Tiếp theo" stacked>
        <Form form={stepperForm} onSubmit={handleStepperSubmit}>
          <FormStepper form={stepperForm} steps={stepperSteps} onSubmit={handleStepperSubmit} />
        </Form>
      </DemoRow>

      <DemoRow label="FormItem — errorColor (4 giá trị)" stacked>
        <FormGrid cols={4}>
          {ERROR_COLOR_DEMO.map((d) => (
            <FormItem key={d.color} error={d.message} errorColor={d.color} label={d.color}>
              <Input readOnly value="Giá trị mẫu" />
            </FormItem>
          ))}
        </FormGrid>
      </DemoRow>

      <DemoRow label="FormGrid — cols 1 · 2 · 3 · 4 (mỗi cột tối đa 28rem)" stacked>
        {DEMO_GRID_COLS.map((cols) => (
          <FormGrid key={cols} cols={cols}>
            {Array.from({ length: cols }, (_, i) => (
              <span
                key={i}
                className="flex h-9 items-center justify-center rounded-md border border-dashed border-border-strong bg-bg-subtle text-caption-12 text-fg-muted tabular-nums"
              >
                cols={cols} · ô {i + 1}
              </span>
            ))}
          </FormGrid>
        ))}
      </DemoRow>

      <DemoRow label="FormRow · FormSection (gập được) · FIELD_HEIGHT" stacked>
        <FormRow align="center" gap={6}>
          <Badge color="info" variant="tinted">
            gap=6
          </Badge>
          <Badge color="info" variant="tinted">
            align=center
          </Badge>
          <Text className="font-mono" size="extraTiny" skin="muted">
            FIELD_HEIGHT: sm={FIELD_HEIGHT.sm} · md={FIELD_HEIGHT.md} · lg={FIELD_HEIGHT.lg}
          </Text>
        </FormRow>
        <FormGrid cols={2}>
          <FormSection collapsible defaultOpen description="defaultOpen=true" title="Mở sẵn">
            <Text size="small">Nội dung hiện ngay.</Text>
          </FormSection>
          <FormSection
            collapsible
            defaultOpen={false}
            description="defaultOpen=false"
            title="Gập sẵn"
          >
            <Text size="small">Bấm tiêu đề để mở.</Text>
          </FormSection>
        </FormGrid>
      </DemoRow>

      <DemoRow label="FormActions sticky — cuộn khung để thấy hàng nút dính đáy" stacked>
        <div className="flex h-40 max-w-md flex-col overflow-y-auto rounded-lg border border-border-default">
          <div className="flex flex-col gap-2 p-3">
            {DEMO_STICKY_LINES.map((line) => (
              <Text key={line} size="small" skin="muted">
                {line}
              </Text>
            ))}
          </div>
          <FormActions
            cancelLabel="Huỷ"
            className="px-3"
            sticky
            submitLabel="Lưu"
            onCancel={() => undefined}
          />
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default FormLayoutSection;
