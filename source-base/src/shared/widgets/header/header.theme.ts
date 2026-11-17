import { SHELL_GUTTER_X } from '@/shared/constants/layout.constants';
import { cn } from '@/shared/utils/style/cn';

/**
 * header.theme.ts — bảng class của vỏ thanh header và nút icon toàn cục.
 *
 * Dùng:   cn(HEADER_SLOT_CLASSES.root, …) cho từng slot
 *         Control bấm được: `HEADER_CONTROL_HEIGHT` (28 · 32 · 36px, thanh 40 · 44 · 52px) · nút icon: `HEADER_ICON_BUTTON_CLASS`
 * Thang:  base 390–639 · sm 640–767 · md 768–1023 (iPad dọc) · lg 1024–1279 (iPad ngang)
 *         · xl 1280–1535 (laptop 14") · 2xl 1536–1799 (laptop 16") · wide ≥ 1800 (màn 24"+, cỡ gốc)
 * Lưu ý:  ⛔ `touch:` là bậc 7 độc lập, chỉ SIẾT không NỚI (không sửa xl / 2xl / wide "cho iPad"); `center` không bao giờ `grow`.
 *         ⛔ Giữ `tv:[--ui-scale:1]` ở `root`: thanh cao cố định, chữ nở là cụm tâm đè chip hai mép.
 *         ⛔ Control cùng MỘT đường tâm (`items-center`); chip tab đứng trên ray đáy (ô nav `items-end`). Viền là màu ĐẶC.
 *         ⛔ Kiểu khung (vát · mũi tên · …) KHÔNG nằm ở đây: `HEADER_SKIN_SPECS[skin].vars` (`page-header/header-skin.theme.ts`).
 *         ⛔ Trang trí của THANH chỉ còn `rail` + `railGlow` (chỉ `dark:`); nút / chip là control — không ngoặc / sọc / vệt
 *            (visual-hierarchy.md §0c). Lý do: docs/notes/code/widgets-header.md
 */

type HeaderSlot = 'root' | 'rail' | 'railGlow' | 'left' | 'right' | 'center' | 'pageSlot' | 'tick';

/**
 * Cao chung của logo · chip ngữ cảnh · nút icon · khối user (28px → `xl` 32px → `wide` 36px, ~70% chiều cao
 * thanh → đệm dọc 6 · 6 · 8px): mọi control bấm được trong thanh dùng hằng này và cùng một đường tâm với bảng tên.
 * KHÔNG thêm bậc `touch:` (`ipad-responsive.md §3.1`) — vùng chạm nới bằng `::after`.
 */
export const HEADER_CONTROL_HEIGHT = 'h-7 xl:h-8 wide:h-9';

/**
 * Khung của chip CÓ CHỮ trong thanh (chip ngữ cảnh) — CHỈ theme tối: viền trong 1px + nền nhạt dần lên trên. KHÔNG góc
 * vát / ngoặc: ảnh mẫu giữ chip ngữ cảnh chỉ có viền mảnh, logo để trần.
 */
export const HEADER_FRAME_CLASS = cn(
  'relative',
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-hud-5)_10%,transparent),color-mix(in_srgb,var(--color-hud-5)_2%,transparent))]',
  'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-hud-5)_65%,transparent)]',
);

/**
 * Vệt mờ mép CUỐI cho dải chip cuộn ngang (chỉ ở `touch:`); tự ẩn khi không tràn.
 * Giữ cả `-webkit-mask-image` lẫn `mask-image` — Safari < 15.4 còn cần tiền tố.
 */
const HEADER_SCROLL_FADE_CLASS = cn(
  'touch:[-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_1.5rem),transparent)]',
  'touch:[mask-image:linear-gradient(to_right,black_calc(100%_-_1.5rem),transparent)]',
);

/** Chuyển động chung của khung nút icon · nút user (`user-menu.theme.ts` dùng lại). */
export const HEADER_FRAME_TRANSITION =
  'transition-[color,border-color,background-color,box-shadow] duration-200 ease-out';

/**
 * Nút icon CHUẨN của thanh — nguồn style duy nhất cho mọi nút icon toàn cục (ThemeToggle,
 * action của app). Cạnh vuông khớp `HEADER_CONTROL_HEIGHT`. Sáng: nút trơn; tối: viền mảnh (không ngoặc góc).
 */
export const HEADER_ICON_BUTTON_CLASS = cn(
  'relative inline-flex shrink-0 items-center justify-center',
  'size-7 xl:size-8 wide:size-9 cursor-pointer outline-none',
  "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-2 touch:after:content-['']",
  '[&>svg]:size-4! wide:[&>svg]:size-5!',
  'border border-transparent bg-transparent text-fg-on-nav-muted',
  'dark:border-hud-5/65 dark:text-fg-on-chrome',
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-hud-5)_12%,transparent),transparent_70%)]',
  HEADER_FRAME_TRANSITION,
  'hover:border-transparent hover:bg-bg-nav-hover hover:text-link',
  'dark:hover:border-primary-4/70 dark:hover:text-primary-3',
  'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-primary-5)_32%,transparent),0_0_10px_color-mix(in_srgb,var(--color-primary-5)_28%,transparent)]',
  'active:bg-bg-nav-active',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
);

/**
 * Chấm báo trên nút icon của thanh (chuông có tin mới…) — đặt `<span className={HEADER_ICON_DOT_CLASS} />` làm con
 * của nút. Viền cùng màu nền thanh nên chấm "khoét" gọn ở cả hai theme; quầng chỉ `dark:`.
 */
export const HEADER_ICON_DOT_CLASS = cn(
  'pointer-events-none absolute right-1 top-1 size-2 rounded-full bg-error wide:right-1.5 wide:top-1.5',
  'ring-2 ring-bg-surface dark:ring-bg-header-to',
  'dark:shadow-[0_0_6px_var(--color-error)]',
);

/**
 * Nút icon của top bar ĐIỆN THOẠI (`phone/PhoneTopBar`) — một hằng cho cả hàng nút (tìm · tài khoản · quay lại của
 * trang) để chúng cùng cỡ. Hình 36px (32px ở máy < 360px hoặc xoay ngang thấp); vùng chạm nới thành 44px / 40px bằng
 * `::after` trong suốt, khe giữa hai nút 8px nên hai vùng chạm không chồng nhau. Sáng: nút trơn; tối: viền mảnh.
 */
export const HEADER_PHONE_BUTTON_CLASS = cn(
  'relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center outline-none',
  'max-[359px]:size-8 [@media(max-height:540px)]:size-8',
  "after:absolute after:-inset-1 after:content-['']",
  'border border-transparent bg-transparent text-fg-on-nav-muted',
  'dark:border-hud-5/65 dark:text-fg-on-chrome',
  'transition-colors duration-150',
  'hover:bg-bg-nav-hover hover:text-link dark:hover:border-primary-5/60',
  'active:bg-bg-nav-active',
  'data-[state=open]:bg-bg-nav-active dark:data-[state=open]:border-primary-5/60',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
  '[&>svg]:size-5!',
);

export const HEADER_SLOT_CLASSES = {
  root: cn(
    'relative z-30 flex shrink-0 items-center justify-between',
    'gap-1 wide:gap-2',
    SHELL_GUTTER_X,
    'bg-bg-surface shadow-[0_1px_4px_var(--color-shadow-popup)]',
    'dark:bg-linear-to-b dark:from-bg-header-from dark:to-bg-header-to',
    'dark:shadow-[0_6px_18px_-6px_var(--color-shadow-popup)] dark:backdrop-blur-md',
    '[--header-bg:var(--color-bg-surface)] dark:[--header-bg:var(--color-bg-header-to)]',
    'text-fg-on-chrome',
    'tv:[--ui-scale:1]',
  ),
  rail: cn(
    'pointer-events-none absolute inset-x-0 bottom-0 h-px',
    'bg-border-default bg-linear-to-r from-transparent via-hud-6/70 to-transparent',
    'dark:bg-transparent dark:via-hud-4',
  ),
  railGlow: cn(
    'pointer-events-none absolute bottom-0 left-1/2 hidden h-0.5 -translate-x-1/2 dark:block',
    'w-40 md:w-56 lg:w-72 wide:w-96',
    'bg-hud-4 opacity-70 blur-[3px]',
  ),
  left: cn(
    'flex min-w-0 items-center gap-1 self-stretch wide:gap-1.5',
    'max-xl:grow max-xl:basis-0 touch:grow touch:basis-0',
    'max-lg:min-w-fit touch:min-w-fit',
  ),
  right: cn(
    'flex shrink-0 items-center justify-end gap-1 self-stretch wide:gap-1.5',
    'max-xl:grow max-xl:basis-0 touch:grow touch:basis-0',
    'max-lg:min-w-fit touch:min-w-fit',
  ),
  center: cn(
    'flex min-w-0 items-center empty:hidden [&>*]:pointer-events-auto',
    'relative self-stretch justify-center',
    'overflow-x-auto overscroll-x-contain scrollbar-hidden',
    HEADER_SCROLL_FADE_CLASS,
    'xl:pointer-events-none xl:absolute xl:inset-y-0 xl:left-1/2 xl:z-10',
    'xl:-translate-x-1/2 xl:justify-center',
    'xl:overflow-visible',
    'xl:w-full',
    'xl:max-w-[min(calc(100vw_-_31rem),832px)] 2xl:max-w-[min(calc(100vw_-_44rem),900px)]',
    'wide:max-w-[min(calc(100vw_-_54rem),1080px)]',
    'touch:pointer-events-auto touch:relative touch:inset-y-auto touch:left-auto',
    'touch:z-auto touch:translate-x-0 touch:justify-center touch:overflow-x-auto',
  ),
  pageSlot: cn(
    'peer flex min-w-0 shrink items-center gap-1 self-stretch empty:hidden',
    'overflow-x-auto overscroll-x-contain scrollbar-hidden',
    HEADER_SCROLL_FADE_CLASS,
    'xl:shrink-0 xl:overflow-visible',
    'touch:shrink touch:overflow-x-auto',
  ),
  tick: 'hidden h-3 w-px shrink-0 self-center bg-divider-nav sm:block peer-empty:hidden wide:h-4',
} satisfies Record<HeaderSlot, string>;
