import type { ComponentType, SVGProps } from 'react';

import { cn } from '@/shared/utils/style/cn';

export interface StaticIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Thành phần icon import TĨNH từ `@/assets/icons` (vd `SunBoldIcon`). */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: number;
}

/**
 * StaticIcon — như `SystemIcon` nhưng nhận THÀNH PHẦN icon thay vì tên, nên bundle chỉ chứa đúng icon được import.
 *
 * Chỉ dùng cho client component nằm trên đường tải của trang công khai và màn lỗi (header, nút đổi giao diện, `ErrorScreen`):
 * `SystemIcon` tra icon theo tên lúc chạy nên kéo cả registry 377 icon (~57 kB gzip) vào mọi client component import nó. Mọi nơi khác
 * vẫn dùng `SystemIcon`. Import sâu `@/shared/ui/icons/StaticIcon` (không qua barrel). Cỡ, màu, `aria-hidden` giống `SystemIcon`.
 *
 * @param props.icon - Thành phần icon, vd `import { SunBoldIcon } from '@/assets/icons'`.
 * @param props.size - Cạnh icon, px. Mặc định `16`.
 *
 * @example
 * <StaticIcon icon={SunBoldIcon} size={16} />
 */
export default function StaticIcon({
  icon: Icon,
  size = 16,
  style,
  className,
  ...props
}: StaticIconProps) {
  return (
    <Icon
      aria-hidden
      className={cn('shrink-0', className)}
      style={{ width: size, height: size, display: 'block', ...style }}
      {...props}
    />
  );
}
