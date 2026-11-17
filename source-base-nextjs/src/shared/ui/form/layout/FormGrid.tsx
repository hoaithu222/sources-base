import { cn } from '@/shared/utils/style/cn';

type GridCols = 1 | 2 | 3 | 4;
type FieldWidth = 'readable' | 'fill';

export interface FormGridProps {
  children: React.ReactNode;
  cols?: GridCols;
  fieldWidth?: FieldWidth;
  className?: string;
}

const FORM_GRID_COL_CLASSES = {
  readable: {
    1: '[grid-template-columns:minmax(0,28rem)]',
    2: 'grid-cols-1 md:[grid-template-columns:repeat(2,minmax(0,28rem))]',
    3: cn(
      'grid-cols-1',
      'md:[grid-template-columns:repeat(2,minmax(0,28rem))]',
      'lg:[grid-template-columns:repeat(3,minmax(0,28rem))]',
    ),
    4: cn(
      'grid-cols-1',
      'md:[grid-template-columns:repeat(2,minmax(0,28rem))]',
      'lg:[grid-template-columns:repeat(4,minmax(0,28rem))]',
    ),
  },
  fill: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
} satisfies Record<FieldWidth, Record<GridCols, string>>;

/**
 * FormGrid — lưới field theo SỐ CỘT (1–4), tự rút về 1 cột trên màn hẹp; mỗi cột có trần 28rem để field
 * không phình ra trên trang rộng.
 *
 * Con trực tiếp là từng field; field cần trải nhiều cột thì gắn `className="md:col-span-2"`. Field nằm ngang
 * kèm nút (thanh lọc) → `FormRow`.
 * Sửa giao diện: số cột theo bề ngang → `FORM_GRID_COL_CLASSES[fieldWidth][cols]`.
 * Lưu ý: giữ `minmax(0,28rem)`, đừng đổi về `1fr` (notes/components/form.md, mục FormGrid).
 *
 * @param props.children - Các field.
 * @param props.cols - Số cột ở màn rộng: `1` | `2` | `3` | `4` (3–4 cột chỉ từ `lg`, `md` là 2). Mặc định `2`.
 * @param props.fieldWidth - `readable` (cột có trần 28rem) | `fill` (cột trải hết khung — ô soạn thảo dài,
 *   bảng nhúng). Mặc định `readable`.
 * @param props.className - Class cho lưới (ghi đè `gap-4`, lề).
 *
 * @example
 * <FormGrid cols={2}>
 *   <TextField name="firstName" label="Họ" />
 *   <TextField name="lastName" label="Tên" />
 * </FormGrid>
 */
function FormGrid({ children, cols = 2, fieldWidth = 'readable', className }: FormGridProps) {
  const gridClassName = cn('grid gap-4', FORM_GRID_COL_CLASSES[fieldWidth][cols], className);

  return <div className={gridClassName}>{children}</div>;
}

export default FormGrid;
