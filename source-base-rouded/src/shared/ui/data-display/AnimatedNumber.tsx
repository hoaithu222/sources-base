import { memo } from 'react';
import { useCountUp } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

export interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * AnimatedNumber — số CHẠY tới giá trị mới thay vì nhảy phịch; kéo mắt về đúng ô vừa có số mới.
 *
 * Luôn `tabular-nums`. Trình đọc màn hình chỉ đọc giá trị cuối (phần đang chạy `aria-hidden`).
 * `prefers-reduced-motion` hoặc `disabled` → hiện thẳng `value`.
 * Lưu ý: `format` chạy MỖI khung hình — giữ thuần và rẻ (không gọi API, không dựng `Intl.NumberFormat` mới).
 * Bảng dài nhiều số → `disabled`.
 * Lý do thiết kế: docs/notes/components/data-display.md (## AnimatedNumber).
 *
 * @param props.value - Giá trị đích.
 * @param props.format - `(value) => string` định dạng số đang chạy. Mặc định `formatNumber` (vi-VN).
 * @param props.prefix - Chữ dính trước số (vd `'≈ '`).
 * @param props.suffix - Chữ dính sau số (vd `' đ'`, `'%'`).
 * @param props.duration - Thời lượng chạy (ms). Mặc định `900`.
 * @param props.disabled - `true` ⇒ không chạy, hiện thẳng giá trị. Mặc định `false`.
 * @param props.className - Class thêm cho `<span>` ngoài.
 *
 * @example
 * <AnimatedNumber value={revenue} suffix=" đ" className="text-h3-bold" />
 */
const AnimatedNumber = memo(function AnimatedNumber({
  value,
  format = formatNumber,
  prefix,
  suffix,
  duration,
  disabled,
  className,
}: AnimatedNumberProps) {
  const current = useCountUp(value, { duration, disabled });

  return (
    <span className={cn('tabular-nums', className)}>
      <span aria-hidden="true">
        {prefix}
        {format(current)}
        {suffix}
      </span>
      <span className="sr-only select-none">{`${prefix ?? ''}${format(value)}${suffix ?? ''}`}</span>
    </span>
  );
});

export default AnimatedNumber;
