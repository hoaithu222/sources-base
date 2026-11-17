import { Children, isValidElement, useMemo, useState } from 'react';
import { get, useFormState } from 'react-hook-form';
import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form';

import Tabs from '@/shared/ui/navigation/tabs/Tabs';
import type { TabOption } from '@/shared/ui/navigation/tabs/Tabs';
import TabsPanel from '@/shared/ui/navigation/tabs/TabsPanel';
import Badge from '@/shared/ui/primitives/Badge';
import { cn } from '@/shared/utils/style/cn';

interface FormTabsPanelProps {
  value: string;
  label: string;
  fields?: string[];
  children: React.ReactNode;
}

export interface FormTabsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  children: React.ReactNode;
  className?: string;
}

const FORM_TABS_ROOT_CLASSES = 'flex flex-col gap-4';
const FORM_TABS_PANEL_CLASSES = 'flex flex-col gap-4 animate-fade-in motion-reduce:animate-none';

/**
 * Panel — một tab của `FormTabs` (`FormTabs.Panel`); chỉ khai báo, `FormTabs` đọc props của nó để dựng tab.
 *
 * Chỉ đặt làm con TRỰC TIẾP của `<FormTabs>` — bọc trong component / Fragment khác thì không được nhận ra.
 *
 * @param props.value - Khoá duy nhất của tab.
 * @param props.label - Chữ trên nút tab.
 * @param props.fields - Tên field thuộc tab (nhận cả đường dẫn lồng `address.city`) để đếm lỗi; thiếu thì
 *   tab không có badge và không được tự nhảy tới khi gửi hỏng.
 * @param props.children - Các field của tab.
 *
 * @example
 * <FormTabs.Panel value="general" label="Chung" fields={['name', 'address.city']}>…</FormTabs.Panel>
 */
function Panel({ children }: FormTabsPanelProps) {
  return <>{children}</>;
}

function countErrors(errors: FieldErrors, fields: string[] | undefined): number {
  return (fields ?? []).filter((name) => get(errors, name) !== undefined).length;
}

/**
 * FormTabsBase — hàm gốc của `FormTabs` (trước khi gắn `Panel`); xem khối tài liệu của `FormTabs`.
 *
 * @example
 * <FormTabsBase form={form}>…</FormTabsBase>
 */
function FormTabsBase<T extends FieldValues>({ form, children, className }: FormTabsProps<T>) {
  const { errors, submitCount } = useFormState({ control: form.control });

  const panels = useMemo(
    () =>
      Children.toArray(children)
        .filter((child) => isValidElement<FormTabsPanelProps>(child))
        .map((child) => child.props),
    [children],
  );

  const errorCounts = useMemo(
    () => new Map(panels.map((panel) => [panel.value, countErrors(errors, panel.fields)])),
    [errors, panels],
  );

  const [selected, setSelected] = useState<string | undefined>(undefined);
  const active = panels.some((panel) => panel.value === selected) ? selected : panels[0]?.value;

  const [handledSubmitCount, setHandledSubmitCount] = useState(submitCount);
  if (submitCount !== handledSubmitCount) {
    setHandledSubmitCount(submitCount);
    const activeHasError = (errorCounts.get(active ?? '') ?? 0) > 0;
    const firstInvalid = panels.find((panel) => (errorCounts.get(panel.value) ?? 0) > 0);
    if (!activeHasError && firstInvalid) setSelected(firstInvalid.value);
  }

  const options = panels.map((panel): TabOption => {
    const count = errorCounts.get(panel.value) ?? 0;
    return {
      key: panel.value,
      label: panel.label,
      trailing:
        count > 0 ? (
          <Badge className="tabular-nums" color="error" size="sm" variant="solid">
            <span aria-hidden>{count}</span>
            <span className="sr-only">, {count} lỗi</span>
          </Badge>
        ) : undefined,
    };
  });

  return (
    <Tabs
      className={cn(FORM_TABS_ROOT_CLASSES, className)}
      options={options}
      value={active}
      onValueChange={setSelected}
    >
      {panels.map((panel) => (
        <TabsPanel key={panel.value} className={FORM_TABS_PANEL_CLASSES} value={panel.value}>
          {panel.children}
        </TabsPanel>
      ))}
    </Tabs>
  );
}

/**
 * FormTabs — form chia tab; mỗi tab có badge đếm lỗi của các field thuộc tab đó.
 *
 * Đặt TRONG `<Form>`, mỗi tab là một `<FormTabs.Panel>` (xem `Panel`). Chỉ tab đang mở được render, giá trị
 * các tab khác vẫn giữ trong form. Nhóm field có thể thu gọn trên cùng một trang → `FormSection`; điền
 * theo thứ tự có kiểm từng bước → `FormStepper`.
 * Sửa giao diện: kiểu nút tab → `Tabs` (FormTabs không có style riêng) · khe + hiệu ứng đổi tab →
 * `FORM_TABS_*_CLASSES`.
 * Lưu ý: `fields` của từng Panel liệt kê tên field để đếm lỗi; thiếu thì tab không có badge. Gửi form hỏng
 * mà tab đang mở không có lỗi → tự nhảy sang tab đầu tiên có lỗi (notes/components/form.md).
 *
 * @param props.form - Kết quả `useZodForm()` / `useForm()` — cùng `form` truyền cho `<Form>`.
 * @param props.children - Các `<FormTabs.Panel>`; phần tử `null` / `false` (tab ẩn theo điều kiện) được bỏ qua.
 * @param props.className - Class cho khối `Tabs` ngoài cùng.
 *
 * @example
 * <Form form={form} onSubmit={save}>
 *   <FormTabs form={form}>
 *     <FormTabs.Panel value="general" label="Chung" fields={['name']}>
 *       <TextField name="name" label="Tên" required />
 *     </FormTabs.Panel>
 *     <FormTabs.Panel value="address" label="Địa chỉ" fields={['address.city']}>
 *       <TextField name="address.city" label="Thành phố" />
 *     </FormTabs.Panel>
 *   </FormTabs>
 * </Form>
 */
const FormTabs = Object.assign(FormTabsBase, { Panel });

export default FormTabs;
