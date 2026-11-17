import { memo, type ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

type DemoGridMin = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type DemoGridAlign = 'start' | 'stretch';

interface DemoGridProps {
  min?: DemoGridMin;
  align?: DemoGridAlign;
  children: ReactNode;
  className?: string;
}

const DEMO_GRID_BASE_CLASSES = 'grid gap-2';

const DEMO_GRID_MIN_CLASSES = {
  xs: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,9rem),1fr))]',
  sm: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))]',
  md: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]',
  lg: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,28rem),1fr))]',
  xl: '[grid-template-columns:repeat(auto-fill,minmax(min(100%,36rem),1fr))]',
} satisfies Record<DemoGridMin, string>;

const DEMO_GRID_ALIGN_CLASSES = {
  start: 'items-start',
  stretch: '',
} satisfies Record<DemoGridAlign, string>;

/**
 * DemoGrid — lưới mẫu của trang `/demo`: khai bề ngang TỐI THIỂU một ô, số cột do màn quyết.
 *
 * Sửa: bề ngang ô → `DEMO_GRID_MIN_CLASSES` · canh mép → `DEMO_GRID_ALIGN_CLASSES`.
 * Lưu ý: `align="start"` chỉ cho mẫu rời chênh cao (vd EmptyState); KHÔNG bật cho hàng thẻ / panel.
 *
 * @param props.min - Bề ngang tối thiểu một ô: `xs` 9rem ô màu / huy hiệu · `sm` 14rem nút / chip ·
 *   `md` 20rem ô nhập · `lg` 28rem thẻ / panel · `xl` 36rem bảng con / biểu đồ. Mặc định `md`.
 * @param props.align - `stretch` (ô cao bằng nhau) | `start` (giữ chiều cao riêng). Mặc định `stretch`.
 * @param props.children - Các mẫu, mỗi mẫu một ô.
 * @param props.className - Class thêm cho lưới.
 *
 * @example
 * <DemoGrid min="sm">
 *   <Button>Một</Button>
 *   <Button>Hai</Button>
 * </DemoGrid>
 */
const DemoGrid = memo(function DemoGrid({
  min = 'md',
  align = 'stretch',
  children,
  className,
}: DemoGridProps) {
  const demoGridClassName = cn(
    DEMO_GRID_BASE_CLASSES,
    DEMO_GRID_MIN_CLASSES[min],
    DEMO_GRID_ALIGN_CLASSES[align],
    className,
  );

  return <div className={demoGridClassName}>{children}</div>;
});

export default DemoGrid;
