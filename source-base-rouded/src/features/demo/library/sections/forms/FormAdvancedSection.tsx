import { memo, useCallback, useMemo } from 'react';

import {
  AsyncSelectField,
  CascadeSelectField,
  ColorPickerField,
  DateRangeField,
  FileField,
  Form,
  FormActions,
  FormGrid,
  FormSection,
  IPAddressField,
  MaskedField,
  PasswordStrength,
  PhoneField,
  Text,
  TimeField,
  useZodForm,
  type UploadHandler,
  showToast,
} from '@/shared/ui';
import { includesSearch } from '@/shared/utils/format/string.utils';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_ADVANCED_DEFAULTS,
  DEMO_ASYNC_CANDIDATES,
  DEMO_DISTRICTS,
  DEMO_MASK_FIELD_CONFIG,
  DEMO_PROVINCES,
  DEMO_WARDS,
  PASSWORD_STRENGTH_DEMO,
  demoAdvancedSchema,
  mockDelay,
  type DemoAdvancedValues,
} from '../../schemas/form-advanced.schema';
import { DEMO_COLOR_PRESET, DEMO_USED_COLORS } from '../../constants/samples.constants';

/**
 * FormAdvancedSection — mục "Hệ form nâng cao" của trang `/demo`: field kén dùng (chọn bất đồng bộ / phân cấp, màu, khoảng ngày, mặt nạ, IP, tệp).
 */
const FormAdvancedSection = memo(function FormAdvancedSection() {
  const form = useZodForm<DemoAdvancedValues>(demoAdvancedSchema, {
    defaultValues: DEMO_ADVANCED_DEFAULTS,
  });

  const fetchAssignees = useCallback(
    (q: string) => mockDelay(DEMO_ASYNC_CANDIDATES.filter((c) => includesSearch(c.label, q))),
    [],
  );
  const cascadeLevels = useMemo(
    () => [
      { name: 'province', label: 'Tỉnh/thành', fetch: () => mockDelay([...DEMO_PROVINCES]) },
      {
        name: 'district',
        label: 'Quận/huyện',
        fetch: (p: string) => mockDelay([...(DEMO_DISTRICTS[p] ?? [])]),
      },
      {
        name: 'ward',
        label: 'Phường/xã',
        fetch: (_p: string, d: string) => mockDelay([...(DEMO_WARDS[d] ?? [])]),
      },
    ],
    [],
  );
  const handleUpload = useCallback<UploadHandler>(
    (file, { onProgress, signal }) =>
      new Promise<string>((resolve, reject) => {
        let pct = 0;
        const t = setInterval(() => {
          pct = Math.min(100, pct + 25);
          onProgress(pct);
          if (pct >= 100) {
            clearInterval(t);
            resolve(URL.createObjectURL(file));
          }
        }, 150);
        signal.addEventListener('abort', () => {
          clearInterval(t);
          reject(new DOMException('Đã huỷ', 'AbortError'));
        });
      }),
    [],
  );
  const handleSubmit = useCallback((v: DemoAdvancedValues) => {
    showToast('success', `Đã lưu ${Object.keys(v).length} field`);
  }, []);

  return (
    <DemoSection
      description="Picker/mask/upload — field kén dùng ngoài nhóm field cơ bản của hệ form."
      importPath="@/shared/ui — trường form nâng cao"
      title="Hệ form — nâng cao"
    >
      <Form form={form} onSubmit={handleSubmit}>
        <FormSection
          description="AsyncSelectField · CascadeSelectField — option nạp qua API (giả lập 300ms)."
          title="Nguồn dữ liệu từ API"
        >
          <FormGrid cols={4}>
            <AsyncSelectField
              fetchOptions={fetchAssignees}
              label="Người phụ trách"
              name="assignee"
              required
            />
            <CascadeSelectField className="contents" levels={cascadeLevels} />
          </FormGrid>
        </FormSection>

        <FormSection
          description="ColorPickerField · DateRangeField · TimeField · IPAddressField · PhoneField."
          title="Bộ chọn & định dạng"
        >
          <FormGrid cols={3}>
            <ColorPickerField
              label="Màu thẻ"
              name="tagColor"
              preset={DEMO_COLOR_PRESET}
              required
              showRandomSuggest
              usedColors={DEMO_USED_COLORS}
            />
            <DateRangeField label="Khoảng thực hiện" name="dateRange" required showQuickSelect />
            <TimeField label="Giờ họp" minuteStep={15} name="meetingTime" required />
            <IPAddressField label="IP (kèm cổng)" name="serverIp" required withPort />
            <PhoneField label="Điện thoại" name="phone" required />
          </FormGrid>
        </FormSection>

        <FormSection description="4 MaskType × 3 FieldSize (sm · md · lg)." title="MaskedField">
          <FormGrid cols={4}>
            {DEMO_MASK_FIELD_CONFIG.map((c) => (
              <MaskedField key={c.type} label={c.label} mask={c.type} name={c.name} size={c.size} />
            ))}
          </FormGrid>
        </FormSection>

        <FormSection
          description="FileField — kéo thả, tiến độ, huỷ / thử lại."
          title="Tệp đính kèm"
        >
          <FormGrid cols={1}>
            <FileField
              accept="image/*,.pdf"
              label="Hồ sơ đính kèm"
              name="attachment"
              onUpload={handleUpload}
            />
          </FormGrid>
        </FormSection>

        <FormActions isSubmitting={form.formState.isSubmitting} submitLabel="Lưu" />
      </Form>

      <DemoRow label="PasswordStrength — 4 mức" stacked>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PASSWORD_STRENGTH_DEMO.map((d) => (
            <div
              key={d.level}
              className="flex flex-col gap-2 rounded-lg border border-border-default bg-bg-subtle p-3"
            >
              <Text className="font-mono" size="extraTiny" skin="muted">
                {d.level} · “{d.value}”
              </Text>
              <PasswordStrength value={d.value} />
            </div>
          ))}
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default FormAdvancedSection;
