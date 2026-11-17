/**
 * Render nông — nhóm `form` (`tests/helpers/render-suite.tsx`).
 *
 * Field cần một `<Form>` thật bọc ngoài (react-hook-form + data router) — dựng bằng `renderInForm`
 * với bộ giá trị `DEFAULTS`. `Form`, `FormTabs`, `FormStepper` cần chính đối tượng `form` nên tự
 * dựng trong harness riêng.
 */

import { screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { expect } from 'vitest';

import {
  AsyncSelectField,
  CascadeSelectField,
  CheckboxField,
  ColorPickerField,
  ConditionalField,
  DateField,
  DateRangeField,
  DictionaryField,
  DynamicSchemaField,
  EmailField,
  FieldArray,
  FileField,
  Form,
  FormActions,
  FormGrid,
  FormItem,
  FormRow,
  FormSection,
  FormStepper,
  FormTabs,
  Input,
  IPAddressField,
  MaskedField,
  MultiSelectField,
  NumberField,
  PasswordField,
  PasswordStrength,
  PhoneField,
  RadioGroupField,
  SelectField,
  SortableFieldArray,
  TextareaField,
  TextField,
  TimeField,
  ToggleField,
} from '@/shared/ui';
import { renderInForm } from '@tests/helpers/render';
import { describeRenderSuite, renderCase, type RenderCase } from '@tests/helpers/render-suite';

interface Values {
  color: string;
  region: string;
  attrs: { key: string; value: string }[];
  members: { name: string }[];
  toggle: boolean;
  extra: string;
  dept: string;
  tags: string[];
  agree: boolean;
  gender: string;
  unitId: string;
  startDate: string;
  startTime: string;
  title: string;
  email: string;
  phone: string;
  host: string;
  password: string;
  note: string;
  qty: number | null;
  amount: string;
}

const DEFAULTS: Values = {
  color: '#22C55E',
  region: '',
  attrs: [],
  members: [{ name: '' }],
  toggle: true,
  extra: '',
  dept: '',
  tags: [],
  agree: false,
  gender: '',
  unitId: '',
  startDate: '',
  startTime: '',
  title: '',
  email: '',
  phone: '',
  host: '',
  password: '',
  note: '',
  qty: null,
  amount: '',
};

const OPTIONS = [
  { value: 'a', label: 'Mục A' },
  { value: 'b', label: 'Mục B' },
];
const noop = () => {};

const inForm = { mount: (ui: ReactElement) => renderInForm<Values>(ui, DEFAULTS) };
/** Dựng trong `<Form>` và khẳng định nhãn `text` hiện ra. */
const inFormShowing = (text: string) => ({
  ...inForm,
  check: () => expect(screen.getByText(text)).toBeInTheDocument(),
});

function FormHarness() {
  const form = useForm<Values>({ defaultValues: DEFAULTS });
  return (
    <Form form={form} onSubmit={noop}>
      <TextField label="Tiêu đề" name="title" />
    </Form>
  );
}

/** `FormTabs` cần chính `form` (để đếm lỗi theo tab), nên không dùng `renderInForm`. */
function TabsHarness() {
  const form = useForm<Values>({ defaultValues: DEFAULTS });
  return (
    <Form form={form} onSubmit={noop}>
      <FormTabs form={form}>
        <FormTabs.Panel fields={['extra']} label="Thông tin" value="a">
          <TextField label="Ghi chú" name="extra" />
        </FormTabs.Panel>
      </FormTabs>
    </Form>
  );
}

function StepperHarness() {
  const form = useForm<Values>({ defaultValues: DEFAULTS });
  return (
    <Form form={form} onSubmit={noop}>
      <FormStepper
        form={form}
        steps={[
          {
            title: 'Thông tin',
            fields: ['title'],
            component: <TextField label="Tiêu đề" name="title" />,
          },
          { title: 'Xác nhận', fields: [], component: <span>Xác nhận</span> },
        ]}
        onSubmit={noop}
      />
    </Form>
  );
}

const CASES: RenderCase[] = [
  // khung form
  renderCase('Form', <FormHarness />, {
    check: () => expect(screen.getByText('Tiêu đề')).toBeInTheDocument(),
  }),
  renderCase(
    'FormItem',
    <FormItem label="Mã hồ sơ">
      <Input aria-label="Mã hồ sơ" />
    </FormItem>,
  ),

  // field chữ
  renderCase('TextField', <TextField label="Tiêu đề" name="title" />, inFormShowing('Tiêu đề')),
  renderCase('EmailField', <EmailField label="Email" name="email" />, inFormShowing('Email')),
  renderCase(
    'PhoneField',
    <PhoneField label="Số điện thoại" name="phone" />,
    inFormShowing('Số điện thoại'),
  ),
  renderCase(
    'IPAddressField',
    <IPAddressField label="Địa chỉ IP" name="host" />,
    inFormShowing('Địa chỉ IP'),
  ),
  renderCase(
    'PasswordField',
    <PasswordField label="Mật khẩu" name="password" />,
    inFormShowing('Mật khẩu'),
  ),
  renderCase(
    'TextareaField',
    <TextareaField label="Ghi chú" name="note" />,
    inFormShowing('Ghi chú'),
  ),
  renderCase('NumberField', <NumberField label="Số lượng" name="qty" />, inFormShowing('Số lượng')),
  renderCase(
    'MaskedField',
    <MaskedField label="Số tiền" mask="currency" name="amount" />,
    inFormShowing('Số tiền'),
  ),
  renderCase('PasswordStrength', <PasswordStrength value="Abc12345" />),

  // field chọn
  renderCase(
    'SelectField',
    <SelectField label="Phòng ban" name="dept" options={OPTIONS} />,
    inFormShowing('Phòng ban'),
  ),
  renderCase(
    'MultiSelectField',
    <MultiSelectField label="Nhãn" name="tags" options={OPTIONS} />,
    inFormShowing('Nhãn'),
  ),
  renderCase(
    'CheckboxField',
    <CheckboxField checkboxLabel="Tôi đồng ý" name="agree" />,
    inFormShowing('Tôi đồng ý'),
  ),
  renderCase(
    'ToggleField',
    <ToggleField label="Thông báo" name="toggle" />,
    inFormShowing('Thông báo'),
  ),
  renderCase(
    'RadioGroupField',
    <RadioGroupField label="Giới tính" name="gender" options={OPTIONS} />,
    inFormShowing('Giới tính'),
  ),
  renderCase(
    'AsyncSelectField',
    <AsyncSelectField fetchOptions={async () => OPTIONS} label="Đơn vị" name="unitId" />,
    inFormShowing('Đơn vị'),
  ),
  renderCase(
    'CascadeSelectField',
    <CascadeSelectField
      levels={[
        {
          name: 'region',
          label: 'Miền',
          fetch: async () => [{ value: 'bac', label: 'Bắc' }],
        },
      ]}
    />,
    inFormShowing('Miền'),
  ),
  renderCase(
    'FileField',
    <FileField label="Tệp đính kèm" name="attachments" />,
    inFormShowing('Tệp đính kèm'),
  ),
  renderCase(
    'DictionaryField',
    <DictionaryField label="Thuộc tính" name="attrs" />,
    inFormShowing('Thuộc tính'),
  ),

  // field ngày giờ / màu
  renderCase(
    'DateField',
    <DateField label="Ngày bắt đầu" name="startDate" />,
    inFormShowing('Ngày bắt đầu'),
  ),
  renderCase(
    'TimeField',
    <TimeField label="Giờ bắt đầu" name="startTime" />,
    inFormShowing('Giờ bắt đầu'),
  ),
  renderCase(
    'DateRangeField',
    <DateRangeField label="Kỳ báo cáo" name="period" />,
    inFormShowing('Kỳ báo cáo'),
  ),
  renderCase(
    'ColorPickerField',
    <ColorPickerField label="Màu nhận diện" name="color" />,
    inFormShowing('Màu nhận diện'),
  ),

  // bố cục
  renderCase(
    'FormSection',
    <FormSection description="Dùng để gửi thông báo" title="Liên hệ">
      <EmailField label="Email" name="email" />
    </FormSection>,
    inFormShowing('Liên hệ'),
  ),
  renderCase(
    'FormGrid',
    <FormGrid cols={2}>
      <TextField label="Họ" name="title" />
      <TextField label="Tên" name="note" />
    </FormGrid>,
    inFormShowing('Họ'),
  ),
  renderCase(
    'FormRow',
    <FormRow align="end">
      <TextField label="Từ khoá" name="title" />
    </FormRow>,
    inFormShowing('Từ khoá'),
  ),
  renderCase('FormActions', <FormActions onCancel={noop} />, inForm),
  renderCase(
    'FieldArray',
    <FieldArray<Values, 'members'> name="members">
      {({ fields }) => (
        <>
          {fields.map((f, i) => (
            <TextField key={f.id} label={`Thành viên ${i + 1}`} name={`members.${i}.name`} />
          ))}
        </>
      )}
    </FieldArray>,
    inFormShowing('Thành viên 1'),
  ),
  renderCase(
    'SortableFieldArray',
    <SortableFieldArray<Values, 'members'> name="members">
      {({ fields }) => (
        <>
          {fields.map((f, i) => (
            <TextField key={f.id} label={`Dòng ${i + 1}`} name={`members.${i}.name`} />
          ))}
        </>
      )}
    </SortableFieldArray>,
    inFormShowing('Dòng 1'),
  ),
  renderCase('FormTabs', <TabsHarness />, {
    check: () => expect(screen.getByText('Thông tin')).toBeInTheDocument(),
  }),

  // mẫu
  renderCase(
    'ConditionalField',
    <ConditionalField condition={(v) => v === true} watch="toggle">
      <TextField label="Ghi chú thêm" name="extra" />
    </ConditionalField>,
    inFormShowing('Ghi chú thêm'),
  ),
  renderCase(
    'DynamicSchemaField',
    <DynamicSchemaField watch="toggle">
      <TextField label="Trường động" name="extra" />
    </DynamicSchemaField>,
    inFormShowing('Trường động'),
  ),
  renderCase('FormStepper', <StepperHarness />, {
    check: () => expect(screen.getByText('Xác nhận')).toBeInTheDocument(),
  }),
];

describeRenderSuite('form', CASES);
