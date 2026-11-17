'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { usePermission } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';
import {
  Button,
  Callout,
  EmailField,
  Form,
  FormGrid,
  NumberField,
  SelectField,
  Surface,
  TextField,
} from '@/shared/ui';

import type { Customer } from '../api/customers.types';
import {
  CUSTOMER_CODE_MAX,
  CUSTOMER_NAME_MAX,
  CUSTOMER_STATUSES,
} from '../constants/customers.constants';
import { useCustomerForm } from '../hooks/useCustomerForm';

interface CustomerFormProps {
  customer?: Customer;
}

/**
 * CustomerForm — form tạo / sửa khách hàng (`react-hook-form` + Zod qua `useCustomerForm`).
 *
 * Có `customer` → sửa, thiếu → tạo. Không có quyền `customer:update` (sửa) / `customer:create` (tạo) thì form chỉ đọc và
 * không có nút lưu — đó chỉ là giao diện, BE vẫn phải kiểm quyền. `dirtyGuard` hỏi lại khi rời trang lúc còn thay đổi chưa lưu;
 * "Huỷ" là liên kết về danh sách. Gắn `key={customer.id}` ở cha để đổi bản ghi thì form dựng lại với giá trị mới.
 *
 * @param props.customer - Bản ghi đang sửa; bỏ trống để tạo mới.
 */
export default function CustomerForm({ customer }: CustomerFormProps) {
  const t = useTranslations('customers');
  const tCommon = useTranslations('ui.common');
  const canWrite = usePermission({ resource: 'customer', action: customer ? 'update' : 'create' });
  const { form, onSubmit, rootError } = useCustomerForm(customer);

  const statusOptions = CUSTOMER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }));

  return (
    <Surface padding="lg">
      <Form dirtyGuard form={form} readOnly={!canWrite} onSubmit={onSubmit}>
        {!canWrite && <Callout intent="info">{t('form.readOnly')}</Callout>}

        <FormGrid cols={2}>
          <TextField
            autoFocus={canWrite && !customer}
            label={t('form.fields.code')}
            maxLength={CUSTOMER_CODE_MAX}
            name="code"
            placeholder={t('form.fields.codePlaceholder')}
            required
          />
          <TextField
            label={t('form.fields.name')}
            maxLength={CUSTOMER_NAME_MAX}
            name="name"
            placeholder={t('form.fields.namePlaceholder')}
            required
          />
          <EmailField label={t('form.fields.email')} name="email" required />
          <TextField
            label={t('form.fields.phone')}
            name="phone"
            placeholder={t('form.fields.phonePlaceholder')}
            type="tel"
          />
          <SelectField
            label={t('form.fields.status')}
            name="status"
            options={statusOptions}
            required
          />
          <NumberField
            description={t('form.fields.creditLimitHint')}
            label={t('form.fields.creditLimit')}
            min={0}
            name="creditLimit"
            required
          />
        </FormGrid>

        <Form.Error message={rootError} />

        <Form.Actions>
          <Button asChild size="md" skin="neutral" variant="secondary">
            <Link href={PATHS.DEMO_CUSTOMERS}>{tCommon('cancel')}</Link>
          </Button>
          {canWrite && (
            <Button loading={form.formState.isSubmitting} size="md" type="submit">
              {customer ? t('form.save') : t('form.create')}
            </Button>
          )}
        </Form.Actions>
      </Form>
    </Surface>
  );
}
