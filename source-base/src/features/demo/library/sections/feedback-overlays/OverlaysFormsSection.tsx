import { memo, useState } from 'react';

import {
  Button,
  ConfirmDialog,
  type ConfirmDialogVariant,
  FormModal,
  type FormModalSize,
  SegmentToggle,
  Text,
  TextareaField,
  TextField,
  Toggle,
  useZodForm,
} from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';

import {
  CONFIRM_VARIANTS,
  FORM_MODAL_SIZE_OPTIONS,
} from '../../constants/feedback-overlays/overlays.constants';
import {
  DEMO_FORM_MODAL_DEFAULTS,
  demoFormModalSchema,
  type DemoFormModalValues,
} from '../../schemas/form-modal.schema';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * OverlaysFormsSection — mục "Hộp thoại có form" của trang `/demo`: `FormModal` · `ConfirmDialog`.
 */
const OverlaysFormsSection = memo(function OverlaysFormsSection() {
  const formModal = useDisclosure();
  const [formSize, setFormSize] = useState<FormModalSize>('md');
  const [formReadOnly, setFormReadOnly] = useState(false);
  const [formScrollable, setFormScrollable] = useState(false);
  const form = useZodForm<DemoFormModalValues>(demoFormModalSchema, {
    defaultValues: DEMO_FORM_MODAL_DEFAULTS,
  });

  const [confirmVariant, setConfirmVariant] = useState<ConfirmDialogVariant | null>(null);
  const [withRecommendation, setWithRecommendation] = useState(true);
  const [withSecondary, setWithSecondary] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);

  return (
    <DemoSection
      description="FormModal · ConfirmDialog — hộp thoại nhập liệu và hộp thoại xác nhận."
      importPath="@/shared/ui · useZodForm"
      title="Hộp thoại nhập liệu"
    >
      <DemoRow label="FormModal · size / readOnly / scrollable" stacked>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentToggle
            options={FORM_MODAL_SIZE_OPTIONS}
            value={formSize}
            onValueChange={(v) => setFormSize(v as FormModalSize)}
          />
          <Toggle checked={formReadOnly} label="readOnly" onCheckedChange={setFormReadOnly} />
          <Toggle checked={formScrollable} label="scrollable" onCheckedChange={setFormScrollable} />
          <Button size="sm" variant="secondary" onClick={formModal.open}>
            Mở FormModal
          </Button>
        </div>
        <FormModal<DemoFormModalValues>
          form={form}
          open={formModal.isOpen}
          readOnly={formReadOnly}
          scrollable={formScrollable}
          size={formSize}
          title="Thông tin hạng mục"
          onConfirm={() => formModal.close()}
          onOpenChange={formModal.onOpenChange}
        >
          <TextField label="Tên hạng mục" name="name" />
          <TextareaField label="Ghi chú" name="note" />
          {formScrollable && (
            <div className="flex h-[900px] items-start justify-center border border-dashed border-border-default p-3">
              <Text size="tiny" skin="muted">
                Nội dung giả cao 900px — chứng minh scrollable tự cuộn thân modal.
              </Text>
            </div>
          )}
        </FormModal>
      </DemoRow>

      <DemoRow
        label="ConfirmDialog · variant / recommendation / secondaryActionLabel / loading"
        stacked
      >
        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            checked={withRecommendation}
            label="recommendation"
            onCheckedChange={setWithRecommendation}
          />
          <Toggle
            checked={withSecondary}
            label="secondaryActionLabel"
            onCheckedChange={setWithSecondary}
          />
          <Toggle checked={confirmLoading} label="loading" onCheckedChange={setConfirmLoading} />
          <Toggle
            checked={secondaryLoading}
            label="secondaryLoading"
            onCheckedChange={setSecondaryLoading}
          />
          {CONFIRM_VARIANTS.map((variant) => (
            <Button
              key={variant}
              size="sm"
              variant="stroke"
              onClick={() => setConfirmVariant(variant)}
            >
              {variant}
            </Button>
          ))}
        </div>
        {confirmVariant ? (
          <ConfirmDialog
            description="Hành động này không hoàn tác được."
            loading={confirmLoading}
            open
            recommendation={withRecommendation ? 'Lưu bản nháp trước khi tiếp tục.' : undefined}
            secondaryActionLabel={withSecondary ? 'Lưu nháp' : undefined}
            secondaryLoading={secondaryLoading}
            title={`Xác nhận (${confirmVariant})`}
            variant={confirmVariant}
            onConfirm={() => setConfirmVariant(null)}
            onOpenChange={(next) => !next && setConfirmVariant(null)}
            onSecondaryAction={() => setConfirmVariant(null)}
          />
        ) : null}
      </DemoRow>
    </DemoSection>
  );
});

export default OverlaysFormsSection;
