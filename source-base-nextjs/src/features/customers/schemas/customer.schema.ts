import { z } from 'zod';

import {
  emailField,
  optionalPhoneField,
  requiredText,
} from '@/shared/utils/validation/validators.utils';

import {
  CUSTOMER_CODE_MAX,
  CUSTOMER_NAME_MAX,
  CUSTOMER_STATUSES,
} from '../constants/customers.constants';

/**
 * Schema Zod của form khách hàng — dựng bằng `createCustomerSchemas(messages)` (câu riêng của feature, ĐÃ DỊCH); email / số điện
 * thoại dùng validator chung nên câu lỗi tự theo ngôn ngữ. Trong component dùng `useCustomerSchemas()`.
 *
 * Lưu ý: `CustomerFormValues` trùng `CustomerInput` — form gửi thẳng cho mutation, `toWriteDto` mới đổi sang hợp đồng BE.
 */

export interface CustomerValidationMessages {
  codeRequired: string;
  codeMax: string;
  nameRequired: string;
  nameMax: string;
  creditLimitInvalid: string;
}

export function createCustomerSchemas(messages: CustomerValidationMessages) {
  const customerFormSchema = z.object({
    code: z.string().trim().min(1, messages.codeRequired).max(CUSTOMER_CODE_MAX, messages.codeMax),
    name: requiredText(messages.nameRequired).max(CUSTOMER_NAME_MAX, messages.nameMax),
    email: emailField(),
    phone: optionalPhoneField(),
    status: z.enum(CUSTOMER_STATUSES),
    creditLimit: z
      .number({ error: messages.creditLimitInvalid })
      .min(0, messages.creditLimitInvalid),
  });

  return { customerFormSchema };
}

export type CustomerSchemas = ReturnType<typeof createCustomerSchemas>;

export type CustomerFormValues = z.infer<CustomerSchemas['customerFormSchema']>;
