import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import type { DropdownOption } from '../dropdown.types';

type DotShape = NonNullable<DropdownOption['dotShape']>;

interface DropdownOptionDotProps {
  color: string;
  shape?: DotShape;
}

const DOT_SHAPE_CLASSES = {
  circle: 'rounded-full',
  square: 'rounded-none',
} satisfies Record<DotShape, string>;

/**
 * DropdownOptionDot — chấm màu DỮ LIỆU đứng trước nhãn option (trong danh sách và trên trigger).
 *
 * Phần con NỘI BỘ của Dropdown. `color` là màu DỮ LIỆU (đi vào `style`), không phải token giao diện.
 * Sửa giao diện: hình chấm → `DOT_SHAPE_CLASSES`.
 *
 * @param props.color - Màu nền chấm (`#RRGGBB` / `var(--color-*)`); `''` = chấm rỗng chỉ có viền.
 * @param props.shape - Hình chấm: `circle` | `square`. Mặc định `circle`.
 *
 * @example
 * <DropdownOptionDot color="var(--color-primary-5)" shape="square" />
 */
const DropdownOptionDot = memo(function DropdownOptionDot({
  color,
  shape = 'circle',
}: DropdownOptionDotProps) {
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 border border-border-strong', DOT_SHAPE_CLASSES[shape])}
      style={color ? { backgroundColor: color, borderColor: 'transparent' } : undefined}
    />
  );
});

export default DropdownOptionDot;
