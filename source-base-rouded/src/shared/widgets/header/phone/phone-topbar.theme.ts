import { cn } from '@/shared/utils/style/cn';

/**
 * phone-topbar.theme.ts — bảng class của top bar ĐIỆN THOẠI (`PhoneTopBar`).
 *
 * Dùng:   cn(PHONE_TOPBAR_SLOT_CLASSES.root, className) · mỗi slot một ô
 * Sửa:    khung + vạch sáng → root · hàng chính (cao 52px, xoay ngang ≤ 44px) → row · tên dự phòng → fallbackTitle
 *         · dải tab của trang → navStrip · nút → `HEADER_PHONE_BUTTON_CLASS` (`header.theme.ts`)
 * Lưu ý:  ⛔ Dải tab (`navStrip`) cuộn ngang và mờ dần mép cuối để báo còn tab phía sau.
 *         ⛔ Lề trái / phải = lề vỏ 16px nhưng không bao giờ hẹp hơn `--safe-l` / `--safe-r`; đệm trên cộng `--safe-t`.
 *         ⛔ Tên KHÔNG `truncate` (gọt dấu chữ HOA tiếng Việt). Mốc `[@media(max-height:540px)]` = xoay ngang thấp,
 *         khớp biến thể `phone:`.
 */

type PhoneTopBarSlot =
  | 'root'
  | 'row'
  | 'lead'
  | 'text'
  | 'titleSlot'
  | 'fallbackTitle'
  | 'actions'
  | 'endSlot'
  | 'navStrip';

export const PHONE_TOPBAR_SLOT_CLASSES = {
  root: cn(
    'relative z-30 flex shrink-0 flex-col',
    'bg-bg-surface shadow-[0_1px_4px_var(--color-shadow-popup)]',
    'pt-[var(--safe-t,0px)] pr-[max(1rem,var(--safe-r,0px))] pl-[max(1rem,var(--safe-l,0px))]',
    "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:content-['']",
    'after:bg-border-default after:bg-linear-to-r after:from-transparent after:via-sky-6/70 after:to-transparent',
    'dark:after:via-border-strong',
    'text-fg-on-chrome',
    '[@media(max-height:540px)]:min-h-11 [@media(max-height:540px)]:flex-row [@media(max-height:540px)]:items-center [@media(max-height:540px)]:gap-2',
  ),
  row: 'flex h-13 items-center gap-2 [@media(max-height:540px)]:contents',
  lead: 'flex shrink-0 items-center gap-2 empty:hidden [@media(max-height:540px)]:order-1',
  text: cn(
    'flex min-w-0 flex-1 items-center',
    '[@media(max-height:540px)]:order-2 [@media(max-height:540px)]:max-w-[45%] [@media(max-height:540px)]:flex-initial',
  ),
  titleSlot: 'peer/title flex min-w-0 items-center empty:hidden',
  fallbackTitle: cn(
    'min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap',
    'text-body-16-bold leading-5! text-fg-on-chrome',
    'peer-[:not(:empty)]/title:hidden',
  ),
  actions:
    'flex shrink-0 items-center gap-2 [@media(max-height:540px)]:order-4 [@media(max-height:540px)]:ml-auto',
  endSlot: 'flex shrink-0 items-center gap-2 empty:hidden',
  navStrip: cn(
    'flex min-w-0 items-center overflow-x-auto overscroll-x-contain scrollbar-hidden empty:hidden',
    '[-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_1.5rem),transparent)]',
    '[mask-image:linear-gradient(to_right,black_calc(100%_-_1.5rem),transparent)]',
    'pb-1.5',
    '[@media(max-height:540px)]:order-3 [@media(max-height:540px)]:flex-1 [@media(max-height:540px)]:pb-0',
  ),
} satisfies Record<PhoneTopBarSlot, string>;
