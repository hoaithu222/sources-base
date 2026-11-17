import { z } from 'zod';

import { requiredText } from '@/shared/utils/validation/validators.utils';

/**
 * Schema Zod của form mẫu trong catalog — dựng bằng `createCatalogFormSchema(messages)` với câu lỗi ĐÃ DỊCH
 * (cùng khuôn `createCustomerSchemas` của feature `customers`).
 */

export interface CatalogFormMessages {
  nameRequired: string;
  passwordMin: string;
  quantityRange: string;
}

export const CATALOG_QUANTITY_MIN = 1;
export const CATALOG_QUANTITY_MAX = 10;
export const CATALOG_PASSWORD_MIN = 8;

export function createCatalogFormSchema(messages: CatalogFormMessages) {
  return z.object({
    name: requiredText(messages.nameRequired),
    password: z.string().min(CATALOG_PASSWORD_MIN, messages.passwordMin),
    quantity: z
      .number({ error: messages.quantityRange })
      .min(CATALOG_QUANTITY_MIN, messages.quantityRange)
      .max(CATALOG_QUANTITY_MAX, messages.quantityRange),
  });
}

export type CatalogFormValues = z.infer<ReturnType<typeof createCatalogFormSchema>>;

export function createCatalogItemSchema(messages: Pick<CatalogFormMessages, 'nameRequired'>) {
  return z.object({ name: requiredText(messages.nameRequired) });
}

export type CatalogItemValues = z.infer<ReturnType<typeof createCatalogItemSchema>>;
