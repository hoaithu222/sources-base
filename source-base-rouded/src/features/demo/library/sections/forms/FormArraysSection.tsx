import { memo } from 'react';

import {
  ConditionalField,
  DictionaryField,
  DynamicSchemaField,
  FieldArray,
  Form,
  FormActions,
  FormGrid,
  FormSection,
  RadioGroupField,
  SortableFieldArray,
  Surface,
  TextField,
  useZodForm,
  showToast,
} from '@/shared/ui';

import DemoSection from '../../components/shell/DemoSection';
import DemoAddRowButton from '../../components/showcase/DemoAddRowButton';
import DemoRemoveRowButton from '../../components/showcase/DemoRemoveRowButton';
import DemoRowIndex from '../../components/showcase/DemoRowIndex';
import {
  CUSTOMER_TYPE_OPTIONS,
  DEMO_ARRAYS_DEFAULTS,
  DEMO_CONDITIONAL_FIELDS,
  demoArraysSchema,
  type DemoArraysValues,
} from '../../schemas/form-arrays.schema';

/**
 * FormArraysSection — mục "Mảng field động" của trang `/demo`: mảng field, mảng lồng, kéo-thả, `DictionaryField`, field điều kiện, schema động.
 */
const FormArraysSection = memo(function FormArraysSection() {
  const form = useZodForm<DemoArraysValues>(demoArraysSchema, {
    defaultValues: DEMO_ARRAYS_DEFAULTS,
  });
  const contactsError = form.formState.errors.contacts;

  return (
    <DemoSection
      description="DictionaryField · FieldArray lồng nhau + kéo-thả · field điều kiện theo schema động."
      importPath="@/shared/ui — field động"
      title="Hệ form — mảng & điều kiện"
    >
      <Form form={form} onSubmit={() => void showToast('success', 'Đã lưu mảng & điều kiện')}>
        <FormGrid cols={2}>
          <FormSection description="DictionaryField · khoá / giá trị tự do" title="Thuộc tính động">
            <DictionaryField
              keyPlaceholder="Khoá"
              label="Thông tin bổ sung"
              name="metadata"
              valuePlaceholder="Giá trị"
            />
          </FormSection>
          <FormSection description="FieldArray · dòng mới tự focus" title="Danh sách liên hệ">
            <FieldArray className="flex flex-col gap-2" control={form.control} name="contacts">
              {({ fields, append, remove }) => (
                <>
                  {fields.map((f, i) => (
                    <div
                      key={f.id}
                      className="grid grid-cols-[auto_1fr_1fr_auto] items-start gap-2"
                    >
                      <DemoRowIndex index={i} />
                      <TextField name={`contacts.${i}.name`} placeholder="Tên" />
                      <TextField name={`contacts.${i}.phone`} placeholder="SĐT" />
                      <DemoRemoveRowButton
                        label={`Xoá liên hệ ${i + 1}`}
                        onClick={() => remove(i)}
                      />
                    </div>
                  ))}
                  <Form.Error message={contactsError?.root?.message ?? contactsError?.message} />
                  <DemoAddRowButton
                    label="Thêm liên hệ"
                    onClick={() => append({ name: '', phone: '' })}
                  />
                </>
              )}
            </FieldArray>
          </FormSection>
          <FormSection description="FieldArray lồng · mảng trong mảng" title="Chương & bài học">
            <FieldArray className="flex flex-col gap-2" control={form.control} name="chapters">
              {({ fields: chapters }) =>
                chapters.map((chapter, ci) => (
                  <Surface key={chapter.id} className="flex flex-col gap-2" padding="sm">
                    <TextField name={`chapters.${ci}.title`} placeholder="Tên chương" />
                    <FieldArray
                      className="flex flex-col gap-2 border-l border-divider-strong pl-3"
                      control={form.control}
                      name={`chapters.${ci}.lessons`}
                    >
                      {({ fields: lessons, append }) => (
                        <>
                          {lessons.map((l, li) => (
                            <TextField
                              key={l.id}
                              name={`chapters.${ci}.lessons.${li}.title`}
                              placeholder="Bài học"
                            />
                          ))}
                          <DemoAddRowButton
                            label="Thêm bài học"
                            onClick={() => append({ title: '' })}
                          />
                        </>
                      )}
                    </FieldArray>
                  </Surface>
                ))
              }
            </FieldArray>
          </FormSection>
          <FormSection description="SortableFieldArray · kéo tay cầm" title="Checklist nghiệm thu">
            <SortableFieldArray control={form.control} name="checklist">
              {({ fields, append, remove }) => (
                <>
                  {fields.map((f, i) => (
                    <SortableFieldArray.Item key={f.id} id={f.id}>
                      <Surface className="flex items-start gap-2" padding="sm">
                        <SortableFieldArray.DragHandle className="mt-1" />
                        <DemoRowIndex index={i} />
                        <TextField className="flex-1" name={`checklist.${i}.label`} />
                        <DemoRemoveRowButton label={`Xoá mục ${i + 1}`} onClick={() => remove(i)} />
                      </Surface>
                    </SortableFieldArray.Item>
                  ))}
                  <DemoAddRowButton label="Thêm mục" onClick={() => append({ label: '' })} />
                </>
              )}
            </SortableFieldArray>
          </FormSection>
          <FormSection description="ConditionalField + DynamicSchemaField" title="Theo điều kiện">
            <RadioGroupField
              label="Loại khách hàng"
              name="customerType"
              options={CUSTOMER_TYPE_OPTIONS}
              orientation="horizontal"
              required
            />
            <DynamicSchemaField watch="customerType">
              {DEMO_CONDITIONAL_FIELDS.map((c) => (
                <ConditionalField
                  key={c.name}
                  condition={(v) => v === c.when}
                  unregisterNames={[c.name]}
                  watch="customerType"
                >
                  <TextField label={c.label} name={c.name} required />
                </ConditionalField>
              ))}
            </DynamicSchemaField>
          </FormSection>
        </FormGrid>

        <FormActions isSubmitting={form.formState.isSubmitting} submitLabel="Lưu" />
      </Form>
    </DemoSection>
  );
});

export default FormArraysSection;
