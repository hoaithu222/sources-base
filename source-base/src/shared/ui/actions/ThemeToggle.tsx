import { memo } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Tooltip from '@/shared/ui/overlays/Tooltip';
import { HUD_HOVER_GLOW } from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';

export type ThemeToggleSize = 'sm' | 'md' | 'lg';

export interface ThemeToggleProps {
  theme: 'light' | 'dark';
  size?: ThemeToggleSize;
  showTooltip?: boolean;
  onToggle: () => void;
  className?: string;
}

const THEME_TOGGLE_BASE_CLASSES = cn(
  'relative inline-flex shrink-0 items-center justify-center cursor-pointer',
  'border border-transparent text-fg-on-nav-muted',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
  'hover:border-primary-5/40 hover:bg-bg-nav-hover hover:text-action-base',
  HUD_HOVER_GLOW,
  'dark:hover:text-primary-3',
  'active:bg-bg-nav-active',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const THEME_TOGGLE_SIZE_CLASSES = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-11',
} satisfies Record<ThemeToggleSize, string>;

const THEME_TOGGLE_ICON_SIZE = {
  sm: 16,
  md: 18,
  lg: 22,
} satisfies Record<ThemeToggleSize, number>;

/**
 * ThemeToggle — nút icon đổi chế độ sáng / tối (kiểu ghost, hợp slot Header / thanh công cụ).
 *
 * Icon, tooltip và tên trợ năng đều chỉ chế độ ĐÍCH (đang tối → mặt trời, "Chuyển sang chế độ sáng").
 * Sửa giao diện: màu / hover / focus → `THEME_TOGGLE_BASE_CLASSES` · khung → `THEME_TOGGLE_SIZE_CLASSES`
 * · cỡ icon → `THEME_TOGGLE_ICON_SIZE`.
 * Lưu ý: controlled hoàn toàn — UI kit KHÔNG đọc store theme; nối store ở `app/shell` (`AppHeader.tsx`).
 * Lưu ý: cỡ icon là style inline của `SystemIcon` — `[&>svg]:size-*` truyền từ ngoài phải kèm `!` mới thắng.
 *
 * @param props.theme - Chế độ ĐANG dùng: `light` | `dark`.
 * @param props.size - Cỡ nút vuông: `sm` 32px | `md` 36px | `lg` 44px (icon 16 / 18 / 22px). Mặc định `md`.
 * @param props.showTooltip - `true` → bọc `Tooltip` nêu chế độ đích (hiện ở dưới nút). Mặc định `true`.
 * @param props.onToggle - Gọi khi bấm; nơi gọi tự đổi `theme`.
 * @param props.className - Class thêm cho `<button>`.
 *
 * @example
 * <ThemeToggle theme={theme} size="sm" onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
 */
const ThemeToggle = memo(function ThemeToggle({
  theme,
  size = 'md',
  showTooltip = true,
  onToggle,
  className,
}: ThemeToggleProps) {
  const isDark = theme === 'dark';
  const iconName = isDark ? 'sun-bold' : 'moon-bold';
  const buttonClassName = cn(THEME_TOGGLE_BASE_CLASSES, THEME_TOGGLE_SIZE_CLASSES[size], className);

  const button = (
    <button
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      className={buttonClassName}
      type="button"
      onClick={onToggle}
    >
      <SystemIcon
        key={iconName}
        aria-hidden
        className="animate-pop-in motion-reduce:animate-none"
        name={iconName}
        size={THEME_TOGGLE_ICON_SIZE[size]}
      />
    </button>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip arrow={false} content={isDark ? 'Chế độ sáng' : 'Chế độ tối'} side="bottom">
      {button}
    </Tooltip>
  );
});

export default ThemeToggle;
