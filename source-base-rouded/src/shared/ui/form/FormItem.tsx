import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

export type ErrorColor = 'error' | 'warning' | 'success' | 'link';

export interface FormItemProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  description?: string;
  error?: string;
  errorColor?: ErrorColor;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
}

const FORM_ITEM_CLASSES = 'flex flex-col gap-1.5';

const FORM_ITEM_LABEL_CLASSES = 'flex items-center gap-1 text-body-14-medium text-fg-subheading';

/** Dấu `*` (màu theo `errorColor`). */
const FORM_ITEM_REQUIRED_CLASSES = 'translate-y-px leading-none font-semibold select-none';

const FORM_ITEM_OPTIONAL_CLASSES = 'text-caption-12 text-fg-muted';

const FORM_ITEM_DESCRIPTION_CLASSES = 'text-caption-12 text-fg-muted';

const FORM_ITEM_MESSAGE_CLASSES = cn(
  'flex items-start gap-1 text-caption-12',
  'animate-chip-in motion-reduce:animate-none',
);

const FORM_ITEM_ERROR_COLOR_CLASSES = {
  error: 'text-error',
  warning: 'text-warning',
  success: 'text-success',
  link: 'text-link',
} satisfies Record<ErrorColor, string>;

const FORM_ITEM_ERROR_ICONS = {
  error: 'circle-exclamation-outline',
  warning: 'triangle-exclamation-outline',
  success: 'circle-check-outline',
  link: 'circle-question-outline',
} satisfies Record<ErrorColor, SystemIconName>;

/**
 * FormItem — khung một field: nhãn + control (`children`) + dòng mô tả / lỗi.
 *
 * Field UI kit (`TextField`…) đã tự bọc FormItem — chỉ dùng trực tiếp khi tự dựng field mới (lấy giá trị bằng
 * `useFormField`, id nối nhãn bằng `useFieldA11y`) hoặc hiện một dòng chỉ đọc có nhãn. Cũng gọi được là
 * `Form.Item`.
 * Sửa giao diện: nhãn → `FORM_ITEM_LABEL_CLASSES` · dòng lỗi → `FORM_ITEM_MESSAGE_CLASSES` · màu / icon
 * theo `errorColor` → `FORM_ITEM_ERROR_COLOR_CLASSES` / `FORM_ITEM_ERROR_ICONS`.
 * Lưu ý: id nối nhãn ↔ ô (`htmlFor` · `labelId` · `descriptionId` · `errorId`) phải do field cấp qua
 * `useFieldA11y` (spread `a11y.item`), FormItem không tự sinh; bỏ trống vẫn chạy (ô read-only). Khi có lỗi,
 * `description` lùi về `sr-only` — docs/notes/components/form.md.
 *
 * @param props.label - Nhãn phía trên control; bỏ trống thì không vẽ `<label>`.
 * @param props.required - `true` → dấu `*` sau nhãn (chỉ hiển thị).
 * @param props.optional - `true` → hiện `optionalLabel` sau nhãn; bị bỏ qua khi `required`.
 * @param props.optionalLabel - Chữ hiện khi `optional`. Mặc định `(Tùy chọn)`.
 * @param props.description - Dòng gợi ý dưới control; có `error` thì chỉ còn cho trình đọc màn hình.
 * @param props.error - Câu lỗi dưới control (`role="alert"`), kèm icon theo `errorColor`.
 * @param props.errorColor - Màu + icon dòng lỗi và màu dấu `*`: `error` | `warning` | `success` | `link`.
 *   Mặc định `error`.
 * @param props.children - Control của field (ô nhập, dropdown…).
 * @param props.className - Class cho khối ngoài cùng (`flex flex-col gap-1.5`).
 * @param props.htmlFor - `id` của `<input>` / `<textarea>` thật để bấm nhãn là focus vào ô (`a11y.id`).
 * @param props.labelId - `id` gắn lên `<label>`; control không phải ô nhập thật trỏ `aria-labelledby` về đây.
 * @param props.descriptionId - `id` gắn lên dòng mô tả (đích của `aria-describedby`).
 * @param props.errorId - `id` gắn lên dòng lỗi (đích của `aria-describedby`).
 *
 * @example
 * const a11y = useFieldA11y({ label: 'Ghi chú', error });
 * <FormItem {...a11y.item} error={error} htmlFor={a11y.id} label="Ghi chú">
 *   <Input {...a11y.input} value={note} onChange={(e) => setNote(e.target.value)} />
 * </FormItem>
 *
 * <FormItem label="Mã hồ sơ">
 *   <Text>{record.code}</Text>
 * </FormItem>
 */
function FormItem({
  label,
  required,
  optional,
  optionalLabel = '(Tùy chọn)',
  description,
  error,
  errorColor = 'error',
  children,
  className,
  htmlFor,
  labelId,
  descriptionId,
  errorId,
}: FormItemProps) {
  const errorColorClassName = FORM_ITEM_ERROR_COLOR_CLASSES[errorColor];

  const itemClassName = cn(FORM_ITEM_CLASSES, className);
  const requiredMarkClassName = cn(FORM_ITEM_REQUIRED_CLASSES, errorColorClassName);
  const messageClassName = cn(FORM_ITEM_MESSAGE_CLASSES, errorColorClassName);

  return (
    <div className={itemClassName}>
      {label && (
        <label className={FORM_ITEM_LABEL_CLASSES} htmlFor={htmlFor} id={labelId}>
          <span>{label}</span>
          {required && (
            <span aria-hidden className={requiredMarkClassName}>
              *
            </span>
          )}
          {!required && optional && (
            <span className={FORM_ITEM_OPTIONAL_CLASSES}>{optionalLabel}</span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <div className="min-h-4">
          <p className={messageClassName} id={errorId} role="alert">
            <SystemIcon
              aria-hidden
              className="mt-0.5"
              name={FORM_ITEM_ERROR_ICONS[errorColor]}
              size={12}
            />
            <span>{error}</span>
          </p>
          {description && (
            <span className="sr-only" id={descriptionId}>
              {description}
            </span>
          )}
        </div>
      ) : (
        description && (
          <p className={FORM_ITEM_DESCRIPTION_CLASSES} id={descriptionId}>
            {description}
          </p>
        )
      )}
    </div>
  );
}

export default FormItem;
