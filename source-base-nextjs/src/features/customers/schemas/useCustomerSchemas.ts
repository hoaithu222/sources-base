'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { CUSTOMER_CODE_MAX, CUSTOMER_NAME_MAX } from '../constants/customers.constants';
import { createCustomerSchemas } from './customer.schema';

/**
 * useCustomerSchemas — schema form khách hàng với thông báo ĐÃ DỊCH theo ngôn ngữ hiện tại (`messages/<locale>/customers.json` →
 * `validation`). Tạo lại khi đổi ngôn ngữ.
 *
 * Dùng:   const { customerFormSchema } = useCustomerSchemas();   const form = useZodForm<CustomerFormValues>(customerFormSchema, …);
 */
export function useCustomerSchemas() {
  const t = useTranslations('customers.validation');

  return useMemo(
    () =>
      createCustomerSchemas({
        codeRequired: t('codeRequired'),
        codeMax: t('codeMax', { max: CUSTOMER_CODE_MAX }),
        nameRequired: t('nameRequired'),
        nameMax: t('nameMax', { max: CUSTOMER_NAME_MAX }),
        creditLimitInvalid: t('creditLimitInvalid'),
      }),
    [t],
  );
}
