import { z } from 'zod';

import { requiredText } from '@/shared/utils/validation/validators.utils';

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'individual', label: 'Cá nhân' },
  { value: 'business', label: 'Doanh nghiệp' },
];

/** Field chỉ hiện với một `customerType` — mỗi dòng là một `<ConditionalField>` trong demo. */
export const DEMO_CONDITIONAL_FIELDS = [
  { when: 'individual', name: 'idCard', label: 'CMND/CCCD' },
  { when: 'business', name: 'taxCode', label: 'Mã số thuế' },
] as const;

/**
 * Check chéo `customerType` → `idCard` / `taxCode` đặt ở `superRefine`, KHÔNG dùng `z.discriminatedUnion`
 * ở gốc: schema còn field không thuộc "loại khách hàng", union gốc sẽ ép CẢ form vào một nhánh.
 */
export const demoArraysSchema = z
  .object({
    metadata: z.record(z.string(), z.string()).default({}),
    contacts: z
      .array(
        z.object({
          name: requiredText('Tên liên hệ là bắt buộc'),
          phone: requiredText('SĐT là bắt buộc'),
        }),
      )
      .min(1, 'Cần ít nhất 1 liên hệ'),
    chapters: z.array(
      z.object({
        title: requiredText('Tên chương là bắt buộc'),
        lessons: z.array(z.object({ title: requiredText('Tên bài học là bắt buộc') })),
      }),
    ),
    checklist: z.array(z.object({ label: requiredText('Nội dung là bắt buộc') })),
    customerType: z.enum(['individual', 'business']),
    idCard: z.string(),
    taxCode: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.customerType === 'individual' && v.idCard.trim().length < 9) {
      ctx.addIssue({ code: 'custom', message: 'CMND/CCCD tối thiểu 9 số', path: ['idCard'] });
    }
    if (v.customerType === 'business' && v.taxCode.trim().length < 10) {
      ctx.addIssue({ code: 'custom', message: 'Mã số thuế tối thiểu 10 số', path: ['taxCode'] });
    }
  });

export type DemoArraysValues = z.infer<typeof demoArraysSchema>;

export const DEMO_ARRAYS_DEFAULTS: DemoArraysValues = {
  metadata: { 'phiên bản': 'v1.2' },
  contacts: [{ name: 'Nguyễn Văn An', phone: '0901234567' }],
  chapters: [{ title: 'Chương 1: Nhập môn', lessons: [{ title: 'Bài 1: Giới thiệu' }] }],
  checklist: [{ label: 'Kiểm tra an toàn giàn giáo' }, { label: 'Nghiệm thu cốt thép' }],
  customerType: 'individual',
  idCard: '',
  taxCode: '',
};
