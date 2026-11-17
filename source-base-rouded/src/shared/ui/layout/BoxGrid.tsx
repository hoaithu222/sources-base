import { memo } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

export type BoxGridMin = 'sm' | 'md' | 'lg' | 'xl';
type BoxGridGap = 'sm' | 'md' | 'lg';
type BoxGridAlign = 'start' | 'stretch';

export interface BoxGridProps {
  min?: BoxGridMin;
  gap?: BoxGridGap;
  align?: BoxGridAlign;
  children: ReactNode;
  className?: string;
}

const BOX_GRID_BASE_CLASSES = 'grid';

const BOX_GRID_MIN_CLASSES = {
  sm: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))]',
  md: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]',
  lg: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,28rem),1fr))]',
  xl: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,36rem),1fr))]',
} satisfies Record<BoxGridMin, string>;

const BOX_GRID_GAP_CLASSES = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
} satisfies Record<BoxGridGap, string>;

const BOX_GRID_ALIGN_CLASSES = {
  start: 'items-start',
  stretch: '',
} satisfies Record<BoxGridAlign, string>;

/**
 * BoxGrid — lưới THẺ / PANEL của trang: khai bề ngang tối thiểu đọc được của một ô (`min`), số cột tự
 * ra theo bề ngang màn (`auto-fill` + `minmax`).
 *
 * Field của form dùng `FormGrid` (khai số cột). Số cột là ý đồ (dải 4 thẻ KPI phải nằm một hàng) thì
 * viết thẳng `grid sm:grid-cols-2 xl:grid-cols-4`, không dùng BoxGrid.
 * Sửa giao diện: bề ngang ô → `BOX_GRID_MIN_CLASSES` · khe → `BOX_GRID_GAP_CLASSES`.
 * Lưu ý: class phải LITERAL (không ghép chuỗi) và giữ `min(100%, …)` — thiếu thì khung hẹp sinh thanh
 * cuộn ngang — docs/notes/components/layout.md.
 *
 * @param props.min - Bề ngang tối thiểu một ô: `sm` 14rem (chip, thẻ đếm nhỏ) | `md` 20rem (thẻ KPI /
 *   trạng thái) | `lg` 28rem (panel có tiêu đề) | `xl` 36rem (panel chứa bảng / biểu đồ). Mặc định `md`.
 * @param props.gap - Khe giữa các ô: `sm` 8px | `md` 12px | `lg` 16px. Mặc định `sm`.
 * @param props.align - `stretch` (các ô một hàng cao bằng nhau) | `start` (ô cao theo nội dung — đừng
 *   bật cho hàng THẺ). Mặc định `stretch`.
 * @param props.children - Các ô của lưới (bắt buộc).
 * @param props.className - Class thêm cho lưới.
 *
 * @example
 * <BoxGrid min="lg" gap="md">
 *   <BoxPanel title="Tiến độ">…</BoxPanel>
 *   <BoxPanel title="Nhân lực">…</BoxPanel>
 * </BoxGrid>
 */
const BoxGrid = memo(function BoxGrid({
  min = 'md',
  gap = 'sm',
  align = 'stretch',
  children,
  className,
}: BoxGridProps) {
  const boxGridClassName = cn(
    BOX_GRID_BASE_CLASSES,
    BOX_GRID_MIN_CLASSES[min],
    BOX_GRID_GAP_CLASSES[gap],
    BOX_GRID_ALIGN_CLASSES[align],
    className,
  );

  return <div className={boxGridClassName}>{children}</div>;
});

export default BoxGrid;
