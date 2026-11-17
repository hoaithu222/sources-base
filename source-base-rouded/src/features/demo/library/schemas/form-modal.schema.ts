import { z } from 'zod';

/** Schema tối giản CHỈ để minh hoạ `readOnly` / `scrollable` của `FormModal` (mục "Hộp thoại nhập liệu"). */
export const demoFormModalSchema = z.object({
  name: z.string().trim().min(1, 'Tên hạng mục là bắt buộc'),
  note: z.string().trim().max(200, 'Tối đa 200 ký tự'),
});

export type DemoFormModalValues = z.infer<typeof demoFormModalSchema>;

export const DEMO_FORM_MODAL_DEFAULTS: DemoFormModalValues = {
  name: 'Hạng mục A — San nền khu B1',
  note: '',
};
