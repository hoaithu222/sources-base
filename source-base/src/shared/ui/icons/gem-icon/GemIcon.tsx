import { useId } from 'react';
import GemIconDefs from './gem-icon-defs';
import GemIconShapes from './gem-icon-shapes';

export type GemColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray';
export type GemSize = 'xs' | 'sm' | 'md';

export interface GemIconProps {
  color?: GemColor;
  size?: GemSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const GEM_COLOR_TOKENS = {
  blue: { main: 'var(--color-sky-5)', glow: 'var(--color-sky-4)' },
  green: { main: 'var(--color-green-5)', glow: 'var(--color-green-4)' },
  yellow: { main: 'var(--color-yellow-5)', glow: 'var(--color-yellow-4)' },
  red: { main: 'var(--color-red-5)', glow: 'var(--color-red-4)' },
  gray: { main: 'var(--color-neutral-5)', glow: 'var(--color-neutral-4)' },
} satisfies Record<GemColor, { main: string; glow: string }>;

/**
 * Màu icon trên mặt ngọc. Sáng: bậc TƯƠI cùng họ (6; vàng 7 vì vàng 6 quá nhạt trên ngọc vàng) + vệt sáng trắng 1px dưới
 * icon để tách khỏi mặt ngọc pastel — bậc 8 cũ ra màu đục (navy, rêu, nâu) "ăn" vào màu ngọc. Tối: trắng (giữ nguyên).
 */
const GEM_CONTENT_COLOR_CLASSES = {
  blue: 'text-sky-6 drop-shadow-[0_1px_0_var(--color-neutral-0)] dark:drop-shadow-none dark:text-fg-heading',
  green:
    'text-green-6 drop-shadow-[0_1px_0_var(--color-neutral-0)] dark:drop-shadow-none dark:text-fg-heading',
  yellow:
    'text-yellow-7 drop-shadow-[0_1px_0_var(--color-neutral-0)] dark:drop-shadow-none dark:text-fg-heading',
  red: 'text-red-6 drop-shadow-[0_1px_0_var(--color-neutral-0)] dark:drop-shadow-none dark:text-fg-heading',
  gray: 'text-neutral-6 drop-shadow-[0_1px_0_var(--color-neutral-0)] dark:drop-shadow-none dark:text-fg-heading',
} satisfies Record<GemColor, string>;

const GEM_SIZE_PX = { xs: 32, sm: 40, md: 56 } satisfies Record<GemSize, number>;

const GEM_ICON_SIZE_PX = { xs: 16, sm: 20, md: 24 } satisfies Record<GemSize, number>;

const GEM_ICON_CENTER_RATIO = 0.3;

const GEM_SVG_STYLE = { position: 'absolute', inset: 0 } as const;

/**
 * GemIcon — khối icon hình đá quý isometric (Figma 469-2502): đặt một `SystemIcon` lên mặt gem, dùng ở thẻ
 * KPI và hộp xác nhận (`ConfirmDialog`).
 *
 * Icon con nằm ở 30% chiều cao (mặt trên của gem), trong ô vuông `GEM_ICON_SIZE_PX`; truyền icon đúng cỡ đó
 * (`xs` 16 · `sm` 20 · `md` 24px). Gem chỉ trang trí (`aria-hidden` trên `<svg>`).
 * Sửa giao diện: màu → `GEM_COLOR_TOKENS` · màu icon → `GEM_CONTENT_COLOR_CLASSES` · cỡ → `GEM_SIZE_PX`
 * / `GEM_ICON_SIZE_PX` · vị trí icon → `GEM_ICON_CENTER_RATIO` · hình → `gem-icon-defs` / `gem-icon-shapes`.
 * Lưu ý: icon con ĐỪNG tự đặt màu (`text-neutral-0`) — nó kế thừa màu theo theme (sáng: bậc tươi cùng họ
 * · tối: trắng).
 * Lưu ý: id gradient / filter / mask lấy từ `useId` để nhiều gem trên một trang không trỏ nhầm nhau
 * — docs/notes/components/icons.md.
 *
 * @param props.color - Màu thân gem: `blue` | `green` | `yellow` | `red` | `gray`. Mặc định `blue`.
 * @param props.size - Cạnh khối: `xs` 32px (hàng KPI dày) | `sm` 40px | `md` 56px. Mặc định `sm`.
 * @param props.icon - Nội dung đặt lên mặt gem (thường `<SystemIcon … />`); thắng `children`.
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
  const rawId = useId();
  const uid = rawId.replace(/:/g, 'g');

  const px = GEM_SIZE_PX[size];
  const iconPx = GEM_ICON_SIZE_PX[size];
  const content = icon ?? children;
  const { main, glow } = GEM_COLOR_TOKENS[color];
  const iconTop = px * GEM_ICON_CENTER_RATIO - iconPx / 2;

  return (
    <div
      className={className}
      style={{ position: 'relative', width: px, height: px, flexShrink: 0 }}
    >
      <svg
        aria-hidden
        fill="none"
        height={px}
        style={GEM_SVG_STYLE}
        viewBox="0 0 56 56"
        width={px}
        xmlns="http://www.w3.org/2000/svg"
      >
        <GemIconDefs glow={glow} main={main} uid={uid} />
        <GemIconShapes glow={glow} uid={uid} />
      </svg>

      {content && (
        <div
          className={GEM_CONTENT_COLOR_CLASSES[color]}
          style={{
            position: 'absolute',
            top: iconTop,
            left: '50%',
            transform: 'translateX(-50%)',
            width: iconPx,
            height: iconPx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default GemIcon;
