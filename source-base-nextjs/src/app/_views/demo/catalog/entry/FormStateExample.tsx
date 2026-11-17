'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import {
  Form,
  FormActions,
  NumberField,
  PasswordField,
  TextField,
  showToast,
  useZodForm,
} from '@/shared/ui';

import { FORM_SAMPLE_VALUES } from '../data/catalog-sample.constants';
import { createCatalogFormSchema } from '../data/catalog.schema';
import type { CatalogFormValues } from '../data/catalog.schema';
import type { CatalogFormState } from '../data/catalog.types';

interface FormStateExampleProps {
  state: CatalogFormState;
}

/**
 * FormStateExample — một form mẫu (`useZodForm` + `Form`) ở đúng một trạng thái: bình thường (có `FormActions`), có lỗi
 * (kiểm ngay lúc hiện để thấy câu lỗi), chỉ đọc (`<Form readOnly>`) hoặc vô hiệu hoá (`disabled` từng field).
 *
 * @param props.state - `default` | `invalid` | `readOnly` | `disabled`; quyết định giá trị đầu và cờ truyền cho field.
 */
export default function FormStateExample({ state }: FormStateExampleProps) {
  const t = useTranslations('demo.form');
  const schema = createCatalogFormSchema({
    nameRequired: t('errors.nameRequired'),
    passwordMin: t('errors.passwordMin'),
    quantityRange: t('errors.quantityRange'),
  });
  const form = useZodForm<CatalogFormValues>(schema, { defaultValues: FORM_SAMPLE_VALUES[state] });
  const disabled = state === 'disabled';

  useEffect(() => {
    if (state === 'invalid') void form.trigger();
  }, [form, state]);

  return (
    <Form
      className="w-full"
      form={form}
      readOnly={state === 'readOnly'}
      onSubmit={() => {
        showToast('success', t('submitted'));
      }}
    >
      <TextField
        disabled={disabled}
        label={t('fields.name')}
        name="name"
        placeholder={t('fields.namePlaceholder')}
        required
      />
      <PasswordField
        disabled={disabled}
        label={t('fields.password')}
        name="password"
        required
        showStrength={state === 'default'}
      />
      <NumberField
        description={t('fields.quantityHint')}
        disabled={disabled}
        label={t('fields.quantity')}
        name="quantity"
      />
      {state === 'default' && (
        <FormActions
          isSubmitting={form.formState.isSubmitting}
          onCancel={() => form.reset(FORM_SAMPLE_VALUES.default)}
        />
      )}
    </Form>
  );
}
