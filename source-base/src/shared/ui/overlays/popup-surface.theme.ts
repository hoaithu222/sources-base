import { cn } from '@/shared/utils/style/cn';
import { HUD_PANEL_FILL, HUD_TOP_RAIL_AFTER } from '@/shared/ui/primitives/hud.theme';

/**
 * popup-surface — bề mặt DUY NHẤT của mọi lớp nổi dạng danh sách (Menu · ContextMenu · Popover · CommandPalette
 *                  · panel bung của Dropdown / MultiSelect / TreeSelect qua FIELD_POPUP_*).
 *
 * Dùng:   cn(popupSurface({ borderWidth: 'thick' }), 'min-w-[220px]') · POPUP_ITEM_CLASS · POPUP_ITEM_ICON_CLASS
 *         · dòng ĐANG CHỌN: POPUP_ITEM_CHECKED_CLASS (+ dấu ✓ POPUP_ITEM_CHECK_CLASS) — `Dropdown` và `Menu` dùng chung
 * Trục:   borderWidth thin | thick   (mặc định thin; Popover dùng thick vì mang cả panel nội dung)
 * Sửa:    nền / viền / quầng → POPUP_SURFACE_BASE_CLASSES · trang trí HUD → POPUP_SURFACE_HUD_CLASSES
 *         · dòng menu → POPUP_ITEM_CLASS
 * Lưu ý:  màu trong shadow qua color-mix(var(--color-*)), KHÔNG rgba chép tay — ui-kit-architecture.md §5b.
 *         ⛔ Bề mặt đã chiếm `::before` (ngoặc góc) + `::after` (ray đỉnh) — nơi dùng KHÔNG gắn pseudo lên chính nó.
 *         Lý do: notes/components/overlays.md#popup-surfacetheme
 */

type PopupSurfaceBorderWidth = 'thin' | 'thick';

const POPUP_SURFACE_BASE_CLASSES = cn(
  'relative z-50 overflow-hidden',
  'border-border-popup bg-bg-popup backdrop-blur-md dark:border-hud-4/55',
  'shadow-[0_10px_30px_var(--color-shadow-popup)]',
  'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-hud-4)_24%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-neutral-10)_70%,transparent),0_0_18px_-6px_color-mix(in_srgb,var(--color-hud-5)_50%,transparent),0_18px_40px_-10px_var(--color-shadow-popup)]',
  'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
);

/**
 * Tối: mặt rọi từ trên + ray sáng đỉnh (nổi trên dòng, `z-10`). KHÔNG ngoặc góc — lớp nổi nhỏ là tầng dưới khung
 * (ngân sách trang trí, visual-hierarchy.md §0c); `::before` để trống.
 */
const POPUP_SURFACE_HUD_CLASSES = cn(HUD_PANEL_FILL, HUD_TOP_RAIL_AFTER, 'dark:after:z-10');

const POPUP_SURFACE_BORDER_WIDTH_CLASSES = {
  thin: 'border',
  thick: 'border-2',
} satisfies Record<PopupSurfaceBorderWidth, string>;

/**
 * Dòng của lớp nổi. Vạch trái là `::before` (màu = nền pseudo — tone `danger` đổi `before:bg-*` là đổi theo);
 * tối: pseudo kéo hết dòng + mask → vạch 2px đặc + dải sáng loang sang phải (cùng nhịp `HUD_ROW_HIGHLIGHT`),
 * nằm SAU chữ nhờ `isolate` + `before:-z-10`.
 */
export const POPUP_ITEM_CLASS = cn(
  'relative isolate flex items-center gap-3 px-3 py-2.5 text-body-14 text-fg-on-chrome',
  'outline-none cursor-pointer select-none transition-colors duration-150 ease-out',
  'data-[highlighted]:bg-bg-nav-hover data-[highlighted]:text-fg-heading',
  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
  "before:content-[''] before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-0.5",
  'before:bg-primary-5 before:scale-y-0 before:transition-transform before:duration-150',
  'data-[highlighted]:before:scale-y-100',
  'dark:before:w-full',
  'dark:before:[mask-image:linear-gradient(90deg,black_2px,color-mix(in_srgb,black_36%,transparent)_2px,color-mix(in_srgb,black_12%,transparent)_28%,transparent_88%)]',
);

export const POPUP_ITEM_ICON_CLASS =
  'inline-flex items-center justify-center shrink-0 size-5 text-fg-on-chrome-muted';

/**
 * Dòng ĐANG CHỌN của lớp nổi (Radix `data-[state=checked]`): nền primary 15%, chữ `text-link` đậm; tối bật vạch trái + dải sáng
 * của `POPUP_ITEM_CLASS` và chữ phát sáng theo `--row-tone`. Ghép SAU `POPUP_ITEM_CLASS`; tông khác ghi đè `--row-tone` (+ `before:bg-*`).
 * Nguồn DUY NHẤT của `Dropdown` (`DROPDOWN_ITEM_CLASSES`) và `Menu` (`MENU_RADIO_ITEM_CLASSES`).
 */
export const POPUP_ITEM_CHECKED_CLASS = cn(
  '[--row-tone:var(--color-primary-5)]',
  'data-[state=checked]:bg-primary-5/15 data-[state=checked]:text-link',
  'data-[state=checked]:text-body-14-semibold',
  'dark:data-[state=checked]:before:scale-y-100',
  'dark:data-[state=checked]:[text-shadow:0_0_10px_color-mix(in_srgb,var(--row-tone)_55%,transparent)]',
);

/** Dấu ✓ cuối dòng đang chọn (icon `check-outline` cỡ 12): màu `text-link`, tối phát sáng theo `--row-tone`. */
export const POPUP_ITEM_CHECK_CLASS = cn(
  'shrink-0 text-link',
  'dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--row-tone)_80%,transparent)]',
);

export function popupSurface({
  borderWidth = 'thin',
}: { borderWidth?: PopupSurfaceBorderWidth } = {}): string {
  return cn(
    POPUP_SURFACE_BASE_CLASSES,
    POPUP_SURFACE_HUD_CLASSES,
    POPUP_SURFACE_BORDER_WIDTH_CLASSES[borderWidth],
  );
}
