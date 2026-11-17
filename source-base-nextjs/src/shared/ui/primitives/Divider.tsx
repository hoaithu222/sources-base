import { cn } from '@/shared/utils/style/cn';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  children?: React.ReactNode;
  className?: string;
}

const DIVIDER_LABELED_CLASSES = 'flex w-full items-center gap-3';

const DIVIDER_LINE_CLASSES = 'flex-1 border-t';

const DIVIDER_LABEL_CLASSES = 'whitespace-nowrap text-caption-12 text-fg-muted';

const DIVIDER_ORIENTATION_CLASSES = {
  horizontal: 'w-full border-t',
  vertical: 'self-stretch border-l',
} satisfies Record<DividerOrientation, string>;

const DIVIDER_VARIANT_CLASSES = {
  solid: 'border-solid border-divider-default',
  dashed: 'border-dashed border-divider-strong',
  dotted: 'border-dotted border-divider-strong',
} satisfies Record<DividerVariant, string>;

/**
 * Divider — đường kẻ ngăn hai khối nội dung (`role="separator"`); đường ngang có thể kèm nhãn ở giữa
 * ("hoặc").
 *
 * Đường dọc giãn theo chiều cao hàng flex của cha; cần cao cố định thì truyền `className="h-4"`.
 * Sửa giao diện: hướng → `DIVIDER_ORIENTATION_CLASSES` · nét + màu → `DIVIDER_VARIANT_CLASSES`
 * · bản có nhãn → `DIVIDER_LABELED_CLASSES` / `DIVIDER_LINE_CLASSES` / `DIVIDER_LABEL_CLASSES`.
 * Lưu ý: `vertical` dùng `self-stretch`, KHÔNG `h-full` (cha cao auto thì `h-full` co về 0) — cha
 * phải là flex row; nét đứt / chấm dùng `divider-strong` để không nhạt hơn nét liền
 * — docs/notes/components/primitives.md.
 *
 * @param props.orientation - Hướng: `horizontal` | `vertical`. Mặc định `horizontal`.
 * @param props.variant - Kiểu nét: `solid` | `dashed` | `dotted`. Mặc định `solid`.
 * @param props.children - Nhãn ở giữa đường kẻ; CHỈ hiện khi `horizontal` (`vertical` bỏ qua).
 * @param props.className - Class thêm cho phần tử gốc (khoảng cách `my-*`, chiều cao đường dọc…).
 *
 * @example
 * <Divider variant="dashed" />
 *
 * <Divider>hoặc</Divider>
 */
function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  children,
  className,
}: DividerProps) {
  if (children && orientation === 'horizontal') {
    const labeledClassName = cn(DIVIDER_LABELED_CLASSES, className);
    const lineClassName = cn(DIVIDER_LINE_CLASSES, DIVIDER_VARIANT_CLASSES[variant]);

    return (
      <div aria-orientation="horizontal" className={labeledClassName} role="separator">
        <div className={lineClassName} />
        <span className={DIVIDER_LABEL_CLASSES}>{children}</span>
        <div className={lineClassName} />
      </div>
    );
  }

  const dividerClassName = cn(
    DIVIDER_ORIENTATION_CLASSES[orientation],
    DIVIDER_VARIANT_CLASSES[variant],
    className,
  );

  return <div aria-orientation={orientation} className={dividerClassName} role="separator" />;
}

export default Divider;
