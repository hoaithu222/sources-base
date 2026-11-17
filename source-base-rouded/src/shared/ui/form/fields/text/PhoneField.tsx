import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import MaskedField from './MaskedField';

export interface PhoneFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: FieldSize;
  format?: string;
}

/**
 * PhoneField — ô số điện thoại (`MaskedField` với `mask="phone"`): chỉ nhận số, tự chèn khoảng cách.
 *
 * Đặt trong `<Form>`; giá trị lưu là chuỗi chữ số KHÔNG kèm khoảng cách (vd `0912345678`).
 * Lưu ý: kiểm hợp lệ bằng Zod `phoneField()` — docs/rules/data/form-validation.md §3.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.format - Mẫu mask riêng (`#` = một chữ số), vd quốc tế `+## ### ### ####`. Mặc định số di
 *   động VN `#### ### ###`.
 *
 * @example
 * <PhoneField name="phone" label="Số điện thoại" required />
 */
function PhoneField({ format, ...props }: PhoneFieldProps) {
  return <MaskedField {...props} format={format} mask="phone" />;
}

export default PhoneField;
