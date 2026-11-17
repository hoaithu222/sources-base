import { cn } from '@/shared/utils/style/cn';

/**
 * popup-surface — bề mặt DUY NHẤT của mọi lớp nổi dạng danh sách (Menu · ContextMenu · Popover
 *                  · panel bung của Dropdown / MultiSelect / TreeSelect qua FIELD_POPUP_*).
 *
 * Dùng:   cn(popupSurface({ borderWidth: 'thick' }), 'min-w-[220px]') · POPUP_ITEM_CLASS · POPUP_ITEM_ICON_CLASS · dòng ĐANG
 *         CHỌN: POPUP_ITEM_CHECKED_CLASS (+ ✓ POPUP_ITEM_CHECK_CLASS) · mặt nổi tự dựng (Toast, bảng của widget): FLOATING_SURFACE_LIGHT_CLASS
 * Trục:   borderWidth thin | thick (mặc định thin)
 * Sửa:    nền · viền · bóng → FLOATING_SURFACE_LIGHT_CLASS · khung (bo góc, hiện / ẩn) → POPUP_SURFACE_BASE_CLASSES
 * Lưu ý:  màu trong shadow qua var(--color-*) / color-mix(var(--color-*)), KHÔNG rgba chép tay — ui-kit-architecture.md §5b.
 *         MỘT diện mạo cho cả hai theme (token tự đảo): bề mặt `rounded-lg`, dòng thụt `mx-1` + `rounded-sm` (khung dòng đệm dọc:
 *         POPUP_LIST_CLASS). ⛔ KHÔNG kính / nền alpha / `backdrop-filter` (light-theme.md §1.5).
 *         Lý do: notes/components/overlays.md#popup-surfacetheme
 */

type PopupSurfaceBorderWidth = 'thin' | 'thick';

/**
 * Mặt nổi dùng chung cho cả hai theme (tên giữ vì nhiều nơi import): nền ĐỤC `bg-dialog` (cao hơn thẻ một tầng ở tối, trắng ở sáng; token `bg-popup` còn alpha 97% → chữ phía sau
 * lộ mờ) · viền 1px `border-strong` đều bốn cạnh · bóng 3 lớp: vệt tiếp xúc 1px (mép dưới SẮC) + bóng gần + bóng xa mềm.
 * Nơi dùng tự thêm `border` (độ dày) + bo góc.
 */
export const FLOATING_SURFACE_LIGHT_CLASS = cn(
  'border-border-strong bg-bg-dialog',
  'shadow-[0_1px_2px_var(--color-shadow-popup),0_6px_14px_-6px_var(--color-shadow-popup),0_18px_40px_-14px_var(--color-shadow-glass)]',
);

/**
 * Khung chung: mặt nổi đục `FLOATING_SURFACE_LIGHT_CLASS`, bo `lg`. Hiện / ẩn `pop-in` / `pop-out` kết thúc ở `transform: none` —
 * không để lại phép biến đổi lẻ làm nhoè chữ.
 */
const POPUP_SURFACE_BASE_CLASSES = cn(
  'relative z-50 overflow-hidden rounded-lg',
  FLOATING_SURFACE_LIGHT_CLASS,
  'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
);

const POPUP_SURFACE_BORDER_WIDTH_CLASSES = {
  thin: 'border',
  thick: 'border-2',
} satisfies Record<PopupSurfaceBorderWidth, string>;

/**
 * Dòng lớp nổi: thụt `mx-1` + `rounded-sm`, KHÔNG vạch trái; `max-w-[calc(100%-0.5rem)]` chặn tràn khi nơi dùng ghép `w-full`
 * (CommandPalette, MultiSelect).
 */
export const POPUP_ITEM_CLASS = cn(
  'relative flex items-center gap-3 px-3 py-2.5 text-body-14 text-fg-on-chrome',
  'mx-1 max-w-[calc(100%-0.5rem)] rounded-sm',
  'outline-none cursor-pointer select-none transition-colors duration-150 ease-out',
  'data-[highlighted]:bg-bg-nav-hover data-[highlighted]:text-fg-heading',
  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
);

/** Khung chứa các dòng (menu, list cuộn của select): đệm dọc 4px để dòng đầu / cuối cũng thụt như hai bên. */
export const POPUP_LIST_CLASS = 'py-1';

export const POPUP_ITEM_ICON_CLASS =
  'inline-flex items-center justify-center shrink-0 size-5 text-fg-on-chrome-muted';

/**
 * Dòng ĐANG CHỌN của lớp nổi (Radix `data-[state=checked]`): nền primary 15%, chữ `text-link` đậm. Ghép SAU `POPUP_ITEM_CLASS`.
 * Nguồn DUY NHẤT của `Dropdown` (`DROPDOWN_ITEM_CLASSES`) và `Menu` (`MENU_RADIO_ITEM_CLASSES`).
 */
export const POPUP_ITEM_CHECKED_CLASS = cn(
  'data-[state=checked]:bg-primary-5/15 data-[state=checked]:text-link',
  'data-[state=checked]:text-body-14-semibold',
);

/** Dấu ✓ cuối dòng đang chọn (icon `check-outline` cỡ 12): màu `text-link`. */
export const POPUP_ITEM_CHECK_CLASS = 'shrink-0 text-link';

export function popupSurface({
  borderWidth = 'thin',
}: { borderWidth?: PopupSurfaceBorderWidth } = {}): string {
  return cn(POPUP_SURFACE_BASE_CLASSES, POPUP_SURFACE_BORDER_WIDTH_CLASSES[borderWidth]);
}
