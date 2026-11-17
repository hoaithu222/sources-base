import { z } from 'zod';

import { requiredText } from '@/shared/utils/validation/validators.utils';

export const demoHooksSchema = z.object({
  note: requiredText('Ghi chú là bắt buộc'),
  /** RatingField tự viết (FormItem + useFormField) — 0 = chưa chấm. */
  satisfaction: z.number().min(1, 'Chọn mức hài lòng').max(5),
});
export type DemoHooksValues = z.infer<typeof demoHooksSchema>;
export const DEMO_HOOKS_DEFAULTS: DemoHooksValues = { note: '', satisfaction: 0 };

export const demoQuickDateSchema = z.object({ quickDate: requiredText('Chọn ngày') });
type DemoQuickDateValues = z.infer<typeof demoQuickDateSchema>;
export const DEMO_QUICK_DATE_DEFAULTS: DemoQuickDateValues = { quickDate: '' };
