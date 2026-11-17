import { cn } from '@/shared/utils/style/cn';
import { HUD_ACTIVE_FILL, HUD_TEXT_GLOW } from '@/shared/ui/primitives/hud.theme';

/**
 * picker-cell.theme — mảnh HUD (CHỈ `dark:`) dùng chung cho mọi ô chọn dạng lưới / cột của nhóm `pickers/`:
 * ô ngày, ô tháng (lịch + MonthGrid), ô giờ / phút, nút ‹ › điều hướng.
 *
 * Dùng:   cn(<class sáng của ô>, PICKER_CELL_HUD_CLASSES.selected) — ghép SAU class sáng để `dark:` đè nền đặc
 * Trục:   hover · selected · inRange · current (hôm nay / tháng này) · nav (nút ‹ ›)
 * Lưu ý:  theme sáng KHÔNG đổi (nền đặc `bg-primary-6` / `bg-primary-5/15` — test khoá). Ô `selected` tối bỏ nền đặc
 *         (`dark:bg-transparent`) để `HUD_ACTIVE_FILL` dâng từ đáy. Lý do: notes/components/pickers.md (## picker-cell.theme)
 */

export const PICKER_CELL_HUD_CLASSES = {
  /** Rê ô: viền trong sáng 1px + quầng trong (ô không có `border`, nên vẽ bằng `inset` shadow). */
  hover:
    'dark:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary-4)_60%,transparent),inset_0_0_12px_color-mix(in_srgb,var(--color-primary-5)_24%,transparent)]',
  selected: cn(
    'dark:bg-transparent dark:text-fg-heading dark:hover:bg-primary-5/15',
    HUD_ACTIVE_FILL,
    HUD_TEXT_GLOW,
  ),
  /** Khoảng giữa: MỘT dải phẳng xanh lá nhạt — các ô liền nhau ghép thành băng liền, không vạch ngang. */
  inRange: cn('dark:bg-transparent', 'dark:bg-primary-5/12'),
  current: cn(
    'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-hud-4)_75%,transparent)]',
    'dark:text-fg-heading',
  ),
  /** Nút ‹ › (tháng / năm): rê = chữ sáng + viền trong + quầng; nút cần `transition-[…,box-shadow]`. */
  nav: cn(
    'dark:enabled:hover:text-primary-3',
    'dark:enabled:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary-4)_60%,transparent),inset_0_0_10px_color-mix(in_srgb,var(--color-primary-5)_28%,transparent),0_0_10px_-3px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
  ),
};
