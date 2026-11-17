import type { SystemIconName } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';
import { colorMix } from '@/shared/utils/style/color-mix.utils';

/**
 * Mô-típ thương hiệu dùng chung: gạch dọc nhấn tiêu đề (màn xác thực) và ô thương hiệu vát góc
 * (logo header · khoang giới thiệu của AuthLayout · trang trạng thái).
 *
 * Dùng:   <div className={TITLE_BAR_CLASS} style={TITLE_BAR_STYLE}>…tiêu đề…</div>
 *         <span className={cn(BRAND_MARK_CLASS, BRAND_MARK_SIZE_CLASSES.sm)}><SystemIcon name={BRAND_MARK_ICON} /></span>
 * Trục:   BRAND_MARK_SIZE_CLASSES  sm (header) | md (trang trạng thái) | lg (khoang thương hiệu)
 * Lưu ý:  ⛔ hai hằng TITLE_BAR_* đi CẶP — viền 2px + khe 16px = lề trái 18px; dùng một cái mà quên
 *         cái kia là chữ dính vào gạch. Ô thương hiệu KHÔNG `border` / `shadow` (clip-path cắt mất);
 *         cỡ icon do bảng cỡ ép bằng `!`. Khai ở `shared` vì layout (`app`) lẫn feature `auth` cùng dùng;
 *         lý do thiết kế: docs/notes/code/constants.md.
 */

type BrandMarkSize = 'sm' | 'md' | 'lg';

/** Viền trái 2px đổ màu `primary-4` → `teal-5` → trong suốt. Đi cặp `TITLE_BAR_CLASS`. */
export const TITLE_BAR_STYLE = {
  borderLeft: '2px solid transparent',
  borderImage: `linear-gradient(180deg, var(--color-primary-4) 0%, var(--color-teal-5) 58%, ${colorMix('var(--color-teal-5)', 0.1)} 100%) 1`,
} as const;

/** Khối chứa tiêu đề: khe giữa gạch dọc và chữ. Đi cặp `TITLE_BAR_STYLE`. */
export const TITLE_BAR_CLASS = 'flex flex-col gap-1 pl-[18px]';

/** Icon của ô thương hiệu — một nguồn cho mọi nơi vẽ logo của app. */
export const BRAND_MARK_ICON = 'layer-group-bold' satisfies SystemIconName;

/** Ô vuông nền primary đặc, vát góc trên-trái + dưới-phải theo `--brand-cut`; ghép một ô cỡ. */
export const BRAND_MARK_CLASS = cn(
  'inline-flex shrink-0 items-center justify-center bg-primary-6 text-neutral-0',
  '[clip-path:polygon(var(--brand-cut)_0,100%_0,100%_calc(100%_-_var(--brand-cut)),calc(100%_-_var(--brand-cut))_100%,0_100%,0_var(--brand-cut))]',
);

export const BRAND_MARK_SIZE_CLASSES = {
  sm: cn(
    'size-5.5 [--brand-cut:5px] [&>svg]:size-3.5!',
    'wide:size-7 wide:[--brand-cut:7px] wide:[&>svg]:size-4.5!',
  ),
  md: 'size-8 [--brand-cut:7px] [&>svg]:size-4.5!',
  lg: 'size-12 [--brand-cut:10px] [&>svg]:size-6!',
} satisfies Record<BrandMarkSize, string>;
