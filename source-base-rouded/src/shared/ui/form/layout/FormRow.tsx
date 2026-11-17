import { cn } from '@/shared/utils/style/cn';

type FormRowGap = 2 | 3 | 4 | 6;
type FormRowAlign = 'start' | 'center' | 'end';

export interface FormRowProps {
  children: React.ReactNode;
  gap?: FormRowGap;
  align?: FormRowAlign;
  className?: string;
}

const FORM_ROW_GAP_CLASSES = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
} satisfies Record<FormRowGap, string>;

const FORM_ROW_ALIGN_CLASSES = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
} satisfies Record<FormRowAlign, string>;

/**
 * FormRow — hàng field nằm ngang (thanh lọc, field + nút), tự xuống dòng khi hết chỗ.
 *
 * Bề ngang mỗi con do chính nó quyết (gắn `className="w-64"` / `flex-1` lên field). Lưới cột đều nhau →
 * `FormGrid`.
 * Sửa giao diện: khoảng cách → `FORM_ROW_GAP_CLASSES` · căn dọc → `FORM_ROW_ALIGN_CLASSES`.
 *
 * @param props.children - Field / nút trong hàng.
 * @param props.gap - Khoảng cách giữa các con (thang spacing): `2` | `3` | `4` | `6`. Mặc định `3`.
 * @param props.align - Căn dọc: `start` | `center` | `end` (`end` để nút thẳng đáy ô có nhãn). Mặc định `start`.
 * @param props.className - Class cho hàng.
 *
 * @example
 * <FormRow align="end" gap={3}>
 *   <TextField name="keyword" label="Từ khoá" className="w-64" />
 *   <Button type="submit">Lọc</Button>
 * </FormRow>
 */
function FormRow({ children, gap = 3, align = 'start', className }: FormRowProps) {
  const rowClassName = cn(
    'flex flex-wrap',
    FORM_ROW_GAP_CLASSES[gap],
    FORM_ROW_ALIGN_CLASSES[align],
    className,
  );

  return <div className={rowClassName}>{children}</div>;
}

export default FormRow;
