import { memo } from 'react';
import type { SVGProps } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { systemIcons } from './index';
import type { SystemIconName } from './index';

export interface SystemIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: SystemIconName;
  size?: number;
}

/**
 * SystemIcon — icon SVG hệ thống theo tên; cách DUY NHẤT để vẽ icon trong app (không inline `<svg>`,
 * không import thẳng từ `@/assets/icons`).
 *
 * Import sâu `@/shared/ui/icons/Icons` (không qua barrel, để barrel không kéo cả registry). Nhận thêm mọi
 * thuộc tính của `<svg>` (`style`, `onClick`…). Màu qua class `text-*` (icon vẽ bằng `currentColor`).
 * Mặc định dùng biến thể `-outline`; `-bold` cho ngữ cảnh nhấn mạnh (docs/rules/styling/icon-conventions.md).
 * Lưu ý: cỡ và `display: block` đặt bằng inline `style` nên class `size-*` / `w-*` / `h-*` / `hidden`
 * KHÔNG có tác dụng — đổi cỡ bằng `size`, cỡ theo % thì qua `style`, ẩn thì ẩn phần tử bọc ngoài
 * (`[&>svg]:size-*` ở nơi dùng phải kèm `!` mới thắng). Icon mặc định `aria-hidden`; icon mang nghĩa thì
 * đặt chữ / `aria-label` ở phần tử bọc ngoài. Con trỏ KẾ THỪA từ phần tử chứa (nút → bàn tay, nút tắt →
 * cấm, chữ → mũi tên) — icon trang trí không tự hiện bàn tay. Tên chưa có trong registry → không vẽ gì
 * (DEV in cảnh báo).
 *
 * @param props.name - Tên icon trong registry sinh tự động (`src/assets/icons/*.svg`), vd `'angle-down-outline'`.
 * @param props.size - Cạnh icon, px. Mặc định `16`.
 *
 * @example
 * <SystemIcon name="angle-down-outline" size={20} className="text-primary-5" />
 *
 * <Button startIcon={<SystemIcon name="trash-outline" />} variant="ghost">Xoá</Button>
 */
export const SystemIcon = memo(function SystemIcon({
  name,
  size = 16,
  style,
  className,
  ...props
}: SystemIconProps) {
  const IconComponent = systemIcons[name];

  if (!IconComponent) {
    if (import.meta.env.DEV) {
      console.warn(
        `[SystemIcon] Icon "${String(name)}" not found. Run \`npm run generate:icons\`.`,
      );
    }
    return null;
  }

  return (
    <IconComponent
      className={cn('shrink-0', className)}
      style={{ width: size, height: size, display: 'block', ...style }}
      {...props}
    />
  );
});

export type { SystemIconName };

/** Tên icon nét đậm (`*-bold`) — prop `icon` của thẻ KPI, `Callout`, `EmptyState`… (nét mảnh chìm trên nền màu). */
export type BoldSystemIconName = Extract<SystemIconName, `${string}-bold`>;
