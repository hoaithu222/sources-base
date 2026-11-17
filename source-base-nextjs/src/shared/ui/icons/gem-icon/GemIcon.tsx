import type { CSSProperties } from 'react';
import { cn } from '@/shared/utils/style/cn';

export type GemColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray';
export type GemSize = 'xs' | 'sm' | 'md';

export interface GemIconProps {
  color?: GemColor;
  size?: GemSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Ô icon: nền tông nhạt + vòng 1px cùng tông (~20%) — phẳng, không quầng. */
const GEM_TILE_BASE_CLASSES = 'edge-hi pointer-events-none absolute inset-0 ring-1 ring-inset';

const GEM_TILE_SIZE_CLASSES = {
  xs: 'rounded-md',
  sm: 'rounded-md',
  md: 'rounded-lg',
} satisfies Record<GemSize, string>;

const GEM_TILE_COLOR_CLASSES = {
  blue: 'bg-sky-5/10 ring-sky-6/20',
  green: 'bg-green-5/12 ring-green-6/22',
  yellow: 'bg-yellow-5/16 ring-yellow-6/30',
  red: 'bg-red-5/10 ring-red-6/18',
  gray: 'bg-neutral-5/10 ring-neutral-6/18',
} satisfies Record<GemColor, string>;

/** Chỗ đặt icon: giữa ô. */
const GEM_CONTENT_BASE_CLASSES =
  'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center';

/** Màu icon: bậc ĐỌC ĐƯỢC của tông trên ô nhạt (≥ 3:1); tối đổi sang bậc sáng hơn cùng họ để vẫn ≥ 4,5:1. */
const GEM_CONTENT_COLOR_CLASSES = {
  blue: 'text-sky-6 dark:text-sky-5',
  green: 'text-green-7 dark:text-green-5',
  yellow: 'text-yellow-7 dark:text-yellow-5',
  red: 'text-red-6 dark:text-red-5',
  gray: 'text-neutral-6 dark:text-fg-muted',
} satisfies Record<GemColor, string>;

const GEM_SIZE_PX = { xs: 32, sm: 40, md: 56 } satisfies Record<GemSize, number>;

const GEM_ICON_SIZE_PX = { xs: 16, sm: 20, md: 24 } satisfies Record<GemSize, number>;

/**
 * GemIcon — khối icon của thẻ KPI và hộp xác nhận (`ConfirmDialog`): ô bo mềm nền tông nhạt + vòng 1px cùng tông,
 * icon giữa ô. Cùng một hình ở cả hai theme, chỉ màu icon đổi bậc.
 *
 * Icon con nằm trong ô vuông `GEM_ICON_SIZE_PX` — truyền icon đúng cỡ đó (`xs` 16 · `sm` 20 · `md` 24px). Phần ô chỉ
 * trang trí (`aria-hidden`).
 * Sửa giao diện: ô → `GEM_TILE_COLOR_CLASSES` / `GEM_TILE_SIZE_CLASSES` · màu icon → `GEM_CONTENT_COLOR_CLASSES`
 * · cỡ → `GEM_SIZE_PX` / `GEM_ICON_SIZE_PX`.
 * Lưu ý: icon con ĐỪNG tự đặt màu (`text-neutral-0`) — nó kế thừa màu theo tông và theme (sáng: bậc đọc được của
 * tông · tối: bậc sáng hơn cùng họ).
 *
 * @param props.color - Tông ô: `blue` | `green` | `yellow` | `red` | `gray`. Mặc định `blue`.
 * @param props.size - Cạnh khối: `xs` 32px (hàng KPI dày) | `sm` 40px | `md` 56px. Mặc định `sm`.
 * @param props.icon - Nội dung đặt giữa ô (thường `<SystemIcon … />`); thắng `children`.
 * @param props.children - Nội dung thay cho `icon` khi không truyền `icon`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <GemIcon color="green" size="md" icon={<SystemIcon name="check-bold" size={24} />} />
 *
 * <GemIcon color="red">
 *   <SystemIcon name="trash-bold" size={20} />
 * </GemIcon>
 */
function GemIcon({ color = 'blue', size = 'sm', icon, children, className }: GemIconProps) {
  const px = GEM_SIZE_PX[size];
  const iconPx = GEM_ICON_SIZE_PX[size];
  const content = icon ?? children;
  const contentStyle = { width: iconPx, height: iconPx } as CSSProperties;

  return (
    <div
      className={className}
      style={{ position: 'relative', width: px, height: px, flexShrink: 0 }}
    >
      <span
        aria-hidden
        className={cn(
          GEM_TILE_BASE_CLASSES,
          GEM_TILE_SIZE_CLASSES[size],
          GEM_TILE_COLOR_CLASSES[color],
        )}
      />

      {content && (
        <div
          className={cn(GEM_CONTENT_BASE_CLASSES, GEM_CONTENT_COLOR_CLASSES[color])}
          style={contentStyle}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default GemIcon;
