import { z } from 'zod';

import type { DropdownOption } from '@/shared/ui';
import { requiredText } from '@/shared/utils/validation/validators.utils';

/**
 * Schema + dữ liệu mẫu cho `FormAdvancedSection` (field kén dùng: picker / mask / upload).
 * Lưu ý: (1) field có mặt nạ (IP, SĐT, MaskedField) validate LỎNG — giá trị `react-number-format` trả
 * về không chắc khớp regex của `ipv4Field()` / `phoneField()`; (2) lỗi khoảng ngày đặt ở
 * `path: ['dateRange']` chứ không `.from`, vì `DateRangeField` coi cả object là MỘT field.
 */

/** Giả lập độ trễ gọi API — dùng cho AsyncSelectField/CascadeSelectField (và `FormHooksSection`). */
export function mockDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

interface DemoAsyncCandidate {
  value: string;
  label: string;
}

export const DEMO_ASYNC_CANDIDATES: readonly DemoAsyncCandidate[] = [
  { value: 'u1', label: 'Nguyễn Văn An' },
  { value: 'u2', label: 'Trần Thị Bình' },
  { value: 'u3', label: 'Lê Minh Cường' },
  { value: 'u4', label: 'Phạm Thu Dung' },
  { value: 'u5', label: 'Vũ Quốc Đạt' },
];

/** Cascade Tỉnh/thành → Quận/huyện → Phường/xã — đủ 3 cấp để thấy refetch. */
export const DEMO_PROVINCES: readonly DropdownOption[] = [
  { value: 'hn', label: 'Hà Nội' },
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
];
export const DEMO_DISTRICTS: Readonly<Record<string, readonly DropdownOption[]>> = {
  hn: [
    { value: 'hn-bd', label: 'Ba Đình' },
    { value: 'hn-hk', label: 'Hoàn Kiếm' },
  ],
  hcm: [
    { value: 'hcm-q1', label: 'Quận 1' },
    { value: 'hcm-q3', label: 'Quận 3' },
  ],
};
export const DEMO_WARDS: Readonly<Record<string, readonly DropdownOption[]>> = {
  'hn-bd': [{ value: 'hn-bd-db', label: 'P. Điện Biên' }],
  'hn-hk': [{ value: 'hn-hk-hb', label: 'P. Hàng Bạc' }],
  'hcm-q1': [{ value: 'hcm-q1-bn', label: 'P. Bến Nghé' }],
  'hcm-q3': [{ value: 'hcm-q3-p6', label: 'P. 6' }],
};

/** 4 `MaskType` × 3 `FieldSize`: mỗi dòng khác cả mask lẫn size nên 4 field phủ đủ cả hai. */
export const DEMO_MASK_FIELD_CONFIG = [
  { type: 'currency', name: 'maskCurrency', label: 'Đơn giá', size: 'sm' },
  { type: 'phone', name: 'maskPhone', label: 'Hotline', size: 'lg' },
  { type: 'tax', name: 'maskTax', label: 'Mã số thuế', size: 'md' },
  { type: 'percent', name: 'maskPercent', label: 'Hao hụt', size: 'md' },
] as const;

export const demoAdvancedSchema = z
  .object({
    assignee: requiredText('Chọn người phụ trách'),
    province: requiredText('Chọn tỉnh/thành'),
    district: requiredText('Chọn quận/huyện'),
    ward: requiredText('Chọn phường/xã'),
    tagColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Chọn một màu hợp lệ'),
    dateRange: z.object({ from: z.string().nullable(), to: z.string().nullable() }),
    meetingTime: requiredText('Chọn giờ họp'),
    serverIp: requiredText('Nhập địa chỉ IP máy chủ'),
    phone: requiredText('Nhập số điện thoại'),
    maskCurrency: z.string().optional().default(''),
    maskPhone: z.string().optional().default(''),
    maskTax: z.string().optional().default(''),
    maskPercent: z.string().optional().default(''),
    attachment: z.unknown().nullable().default(null),
  })
  .refine((v) => v.dateRange.from !== null && v.dateRange.to !== null, {
    message: 'Chọn khoảng ngày',
    path: ['dateRange'],
  });

export type DemoAdvancedValues = z.infer<typeof demoAdvancedSchema>;

export const DEMO_ADVANCED_DEFAULTS: DemoAdvancedValues = {
  assignee: '',
  province: '',
  district: '',
  ward: '',
  tagColor: '#22C55E',
  dateRange: { from: null, to: null },
  meetingTime: '',
  serverIp: '',
  phone: '',
  maskCurrency: '',
  maskPhone: '',
  maskTax: '',
  maskPercent: '',
  attachment: null,
};

export const PASSWORD_STRENGTH_DEMO = [
  { level: 'empty', value: '' },
  { level: 'weak', value: 'abcdefg' },
  { level: 'moderate', value: 'ABC12' },
  { level: 'strong', value: 'Abcdefg1' },
];
