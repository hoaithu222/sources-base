import { z } from 'zod';

/** Schema mẫu của trang Demo (bản mẫu cho `form-validation.md`): ô CHỮ bắt buộc `.trim()` trước `.min(1)`. */
export const demoFormSchema = z
  .object({
    code: z.string().trim().min(1, 'Mã là bắt buộc').max(20, 'Tối đa 20 ký tự'),
    name: z.string().trim().min(1, 'Tên hạng mục là bắt buộc').max(120, 'Tối đa 120 ký tự'),
    email: z.string().trim().min(1, 'Email là bắt buộc').email('Email không đúng định dạng'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    unit: z.string().min(1, 'Chọn đơn vị tính'),
    trades: z.array(z.string()).min(1, 'Chọn ít nhất một bộ môn'),
    quantity: z.number().min(0, 'Không được âm'),
    startDate: z.string().min(1, 'Chọn ngày bắt đầu'),
    endDate: z.string().min(1, 'Chọn ngày kết thúc'),
    note: z.string().trim().max(500, 'Tối đa 500 ký tự'),
    priority: z.string().min(1, 'Chọn mức ưu tiên'),
    notify: z.boolean(),
    accept: z.literal(true, { message: 'Phải đồng ý điều khoản' }),
  })
  .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, {
    message: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc',
    path: ['endDate'],
  });

export type DemoFormValues = z.infer<typeof demoFormSchema>;

export const DEMO_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp' },
  { value: 'normal', label: 'Bình thường' },
  { value: 'high', label: 'Cao' },
];

/** Giá trị khởi tạo — giữ ở phạm vi module: object mới mỗi lần render sẽ khiến RHF reset form. */
export const DEMO_FORM_DEFAULTS: DemoFormValues = {
  code: '',
  name: '',
  email: '',
  password: '',
  unit: 'm3',
  trades: ['civil'],
  quantity: 0,
  startDate: '',
  endDate: '',
  note: '',
  priority: 'normal',
  notify: true,
  accept: true,
};
