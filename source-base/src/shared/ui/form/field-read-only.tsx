import { cn } from '@/shared/utils/style/cn';
import FormItem from './FormItem';

interface FieldReadOnlyProps {
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Theme tối: gạch chân 1px dốc mờ dần sang phải (vẽ bằng nền, KHÔNG viền) — "ô đọc" HUD mà không đổi chiều cao. */
const FIELD_READ_ONLY_VALUE_CLASSES = cn(
  'py-2 text-body-14 text-fg-heading whitespace-pre-wrap break-words',
  'dark:bg-[linear-gradient(90deg,var(--color-border-strong),color-mix(in_srgb,var(--color-border-default)_60%,transparent)_45%,transparent)]',
  'dark:bg-[length:100%_1px] dark:bg-bottom dark:bg-no-repeat',
);

const FIELD_READ_ONLY_EMPTY_CLASSES = 'text-fg-faint';

const isEmptyValue = (value: React.ReactNode) => value == null || value === '' || value === false;

/**
 * FieldReadOnly — dạng chỉ đọc của một field khi `<Form readOnly>`: nhãn + giá trị dạng chữ, không ô nhập.
 *
 * Phần con NỘI BỘ của các field UI kit — mọi field dùng chung để chữ chỉ đọc cùng cỡ, cùng màu, và hàng cao
 * bằng ô `md` (`py-2` + dòng 20px) nên đổi sửa ↔ xem không xô lệch. Field tự định dạng giá trị (nhãn của dòng
 * đã chọn, ngày `DD/MM/YYYY`, chấm màu, danh sách liên kết) rồi truyền vào `children`; giá trị rỗng
 * (`null` · `undefined` · `''` · `false`) hiện "—" mờ. Chuỗi nhiều dòng giữ xuống dòng, chữ dài tự ngắt.
 * Sửa giao diện: chữ giá trị + gạch chân (tối) → `FIELD_READ_ONLY_VALUE_CLASSES` · dấu "—" khi trống →
 * `FIELD_READ_ONLY_EMPTY_CLASSES`.
 *
 * @param props.label - Nhãn của field (giống lúc nhập).
 * @param props.className - Class cho khung `FormItem` bọc ngoài — truyền lại `className` của field.
 * @param props.children - Giá trị đã định dạng để hiển thị (chữ hoặc node); rỗng → "—".
 *
 * @example
 * if (readOnly) return <FieldReadOnly className={className} label={label}>{selectedLabel}</FieldReadOnly>;
 */
function FieldReadOnly({ label, className, children }: FieldReadOnlyProps) {
  return (
    <FormItem className={className} label={label}>
      <div className={FIELD_READ_ONLY_VALUE_CLASSES}>
        {isEmptyValue(children) ? (
          <span className={FIELD_READ_ONLY_EMPTY_CLASSES}>—</span>
        ) : (
          children
        )}
      </div>
    </FormItem>
  );
}

export default FieldReadOnly;
