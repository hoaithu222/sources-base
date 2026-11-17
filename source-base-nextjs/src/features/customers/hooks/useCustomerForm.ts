'use client';

import { useTranslations } from 'next-intl';

import { isAppError } from '@/core/http';
import { useRouter } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { useLatestRequest } from '@/shared/hooks';
import { showToast, useServerErrors, useZodForm } from '@/shared/ui';

import type { Customer, CustomerInput } from '../api/customers.types';
import { CUSTOMER_CODE_TAKEN } from '../constants/customers.constants';
import { useCustomerSchemas } from '../schemas/useCustomerSchemas';
import type { CustomerFormValues } from '../schemas/customer.schema';
import { useCreateCustomer, useUpdateCustomer } from '../service/customers.queries';
import { toCustomerInput } from '../utils/customer-mapping.utils';

const EMPTY_INPUT: CustomerInput = {
  code: '',
  name: '',
  email: '',
  phone: '',
  status: 'active',
  creditLimit: 0,
};

/**
 * useCustomerForm — form tạo / sửa khách hàng: schema đã dịch, gửi, hiện lỗi máy chủ, toast thành công rồi về danh sách.
 *
 * Có `customer` → sửa (`PUT`), không → tạo (`POST`). Lỗi KHÔNG ném ra ngoài `onSubmit`: 409 mã trùng → lỗi ở ô `code`; lỗi có
 * `fieldErrors` (422) → vào từng ô; lỗi khác (5xx, mất mạng) → `rootError`. Form GIỮ nguyên dữ liệu khi lỗi.
 *
 * @param customer - Bản ghi đang sửa; bỏ trống để tạo mới.
 * @returns `{ form, onSubmit, rootError }` — nối vào `<Form form onSubmit>` và `<Form.Error message={rootError} />`.
 */
export function useCustomerForm(customer?: Customer) {
  const t = useTranslations('customers.form');
  const router = useRouter();
  const { customerFormSchema } = useCustomerSchemas();
  const form = useZodForm<CustomerFormValues>(customerFormSchema, {
    defaultValues: customer ? toCustomerInput(customer) : EMPTY_INPUT,
  });
  const { applyServerErrors, rootError } = useServerErrors(form);
  const { begin } = useLatestRequest();
  const create = useCreateCustomer();
  const update = useUpdateCustomer();

  const onSubmit = async (values: CustomerFormValues) => {
    const isCurrent = begin();
    try {
      if (customer) await update.mutateAsync({ id: customer.id, input: values });
      else await create.mutateAsync(values);
    } catch (error) {
      if (!isCurrent()) return;
      if (isAppError(error) && error.code === CUSTOMER_CODE_TAKEN) {
        form.setError('code', { type: 'server', message: t('codeTaken') });
      } else {
        applyServerErrors(error);
      }
      return;
    }
    if (!isCurrent()) return;
    form.reset(values);
    showToast('success', customer ? t('updated') : t('created'));
    router.push(PATHS.DEMO_CUSTOMERS);
  };

  return { form, onSubmit, rootError };
}
