import { z } from 'zod';

import { emailField, requiredText } from '@/shared/utils/validation/validators.utils';

export const demoTabsSchema = z.object({
  fullName: requiredText('Họ tên là bắt buộc'),
  email: emailField(),
  companyName: requiredText('Tên công ty là bắt buộc'),
  taxId: requiredText('Mã số thuế là bắt buộc'),
});
export type DemoTabsValues = z.infer<typeof demoTabsSchema>;
export const DEMO_TABS_DEFAULTS: DemoTabsValues = {
  fullName: '',
  email: '',
  companyName: '',
  taxId: '',
};

export const demoStepperSchema = z.object({
  stepName: requiredText('Họ tên là bắt buộc'),
  stepEmail: emailField(),
  stepAddress: requiredText('Địa chỉ là bắt buộc'),
  stepCity: requiredText('Tỉnh/thành là bắt buộc'),
  stepAgree: z.literal(true, { message: 'Phải xác nhận thông tin trước khi hoàn tất' }),
});
export type DemoStepperValues = z.infer<typeof demoStepperSchema>;
/**
 * `stepAgree` mặc định `true` vì `z.literal(true)` buộc kiểu của default cũng là `true`
 * (cùng quy ước `accept` ở `form-showcase.schema.ts`).
 */
export const DEMO_STEPPER_DEFAULTS: DemoStepperValues = {
  stepName: '',
  stepEmail: '',
  stepAddress: '',
  stepCity: '',
  stepAgree: true,
};

/** Số cột trình diễn `FormGrid` — đủ cả 4 giá trị của prop `cols`. */
export const DEMO_GRID_COLS = [1, 2, 3, 4] as const;

/** Nội dung giả trong khung cuộn để thấy `FormActions sticky` dính đáy. */
export const DEMO_STICKY_LINES = [
  'Hạng mục: Kết cấu móng khối A',
  'Khối lượng: 1.250 m³ — đã nghiệm thu 62%',
  'Đơn vị thi công: Đội 3 — ca ngày',
  'Ghi chú: kiểm tra cốt thép trước khi đổ bê tông',
  'Người phụ trách: Nguyễn Văn An',
  'Hạn hoàn thành: 30/09',
];

export const ERROR_COLOR_DEMO = [
  { color: 'error' as const, message: 'Trường này là bắt buộc' },
  { color: 'warning' as const, message: 'Giá trị gần vượt ngưỡng' },
  { color: 'success' as const, message: 'Đã xác thực với hệ thống' },
  { color: 'link' as const, message: 'Xem hướng dẫn điền trường' },
];
