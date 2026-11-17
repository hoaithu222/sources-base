import type { CSSProperties } from 'react';

import type { TitleIconColor } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import type { PageHeaderChipSlant } from './page-nav.theme';

/**
 * page-header.theme.ts — bảng class của cụm tâm do PAGE bơm vào thanh header: bảng tên + hai ô nav. HÌNH bảng tên, dấu nhấn
 * và núm sáng đáy do `header-skin.theme.ts` chọn, đa giác ở `shapes/plate-shapes.theme.ts`.
 * Bảng class của CHIP (tab · action · quay lại) ở `page-nav.theme.ts`.
 *
 * Dùng:   cn(PAGE_HEADER_SLOT_CLASSES.title, PAGE_HEADER_SIZE_CLASSES[size].title[fit], …) — ô slot là nền, ô trục ghép thêm.
 * Trục:   side (VỊ TRÍ) left | right · layout sided | free · size md | sm · fit base | snug | tight (cỡ chữ theo độ dài tên).
 * Lưu ý:  ⛔ Bảng tên KHÔNG có `border` (clip-path cắt): viền = lớp `plateEdge` + lớp thân `plateBg` thụt 1px, cùng MỘT đa giác.
 *         ⛔ Bảng tên cao TRỌN thanh, tab thấp hơn và đứng trên ray đáy; khe chip ↔ chip ↔ bảng tên đều nhờ `--nav-pad` (cấu hình
 *            ở `header-skin.theme.ts`) — bảng tên chui vào ô nav đúng `--plate-tuck` để cạnh vát song song cạnh chip.
 *         ⛔ Từ `xl` ô nav rộng theo nội dung (`basis-auto`) — cánh nhiều tab đẩy bảng tên lệch về cánh ít tab;
 *            hết chỗ thì ô nav cuộn ngang, KHÔNG để chip chui dưới bảng tên.
 *         Lý do thiết kế: docs/notes/code/widgets-header.md
 */

/** VỊ TRÍ so với bảng tên: ô nav / cánh `///` bên trái hay bên phải. */
export type PageHeaderSide = 'left' | 'right';

export type PageHeaderTitleSize = 'md' | 'sm';
/** Cỡ chữ tiêu đề theo độ dài: `base` (≤ 16 ký tự) · `snug` (≤ 26, hạ một bậc) · `tight` (dài hơn, hạ hai bậc). */
export type PageHeaderTitleFit = 'base' | 'snug' | 'tight';
/** Bố cục cụm tâm: `sided` có tab hai bên (viền bảng tên bị che từ đường khay) · `free` không tab (viền vẽ liền thẳng lên mép trên). */
export type PageHeaderLayout = 'sided' | 'free';

type PageHeaderSlot =
  | 'cluster'
  | 'navCell'
  | 'plate'
  | 'plateEdge'
  | 'plateEdgeCapped'
  | 'plateBg'
  | 'plateBgSolid'
  | 'plateTopBar'
  | 'plateRailSolid'
  | 'plateMark'
  | 'plateRail'
  | 'plateHandle'
  | 'plateFlank'
  | 'plateRule'
  | 'wing'
  | 'wingBar'
  | 'wingDense'
  | 'wingGlow'
  | 'railGlow'
  | 'titleBlock'
  | 'title'
  | 'subtitleRow'
  | 'subtitleRule'
  | 'subtitle';

/**
 * Hướng vát chip của từng dải: cạnh chip kề bảng tên SONG SONG với cạnh vát của bảng tên keystone (vai trái `\`, vai
 * phải `/`), nên khe giữa chip và bảng tên là một dải chéo đều, không loe hình chữ V. Dải trái vát `left` (`\`), dải
 * phải vát `right` (`/`).
 */
export const PAGE_HEADER_NAV_SLANT = {
  left: 'left',
  right: 'right',
} as const satisfies Record<PageHeaderSide, PageHeaderChipSlant>;

/** Biến `--plate-tone` của một tông — đặt ở CỤM TÂM để bảng tên VÀ thanh khay (`PAGE_NAV_SHELF_CLASSES`) cùng đọc. */
export const plateToneStyle = (tone: TitleIconColor): CSSProperties => ({
  ['--plate-tone' as string]: `var(--color-${tone}-5)`,
});

/** Số ký tự tối đa của mỗi bậc `fit`: `base` ≤ 16, `snug` ≤ 26, còn lại `tight`. */
const TITLE_FIT_LIMITS = { base: 16, snug: 26 } as const;

/** Chọn bậc cỡ chữ theo độ dài tên (đếm ký tự hiển thị, không đếm byte) — chữ co lại TRƯỚC khi bị cắt "…". */
export function pageHeaderTitleFit(title: string): PageHeaderTitleFit {
  const length = Array.from(title.normalize('NFC').trim()).length;
  if (length <= TITLE_FIT_LIMITS.base) return 'base';
  return length <= TITLE_FIT_LIMITS.snug ? 'snug' : 'tight';
}

export const PAGE_HEADER_SLOT_CLASSES = {
  cluster: 'pointer-events-auto flex h-full min-w-0 items-center justify-center',
  navCell: cn(
    'relative isolate flex h-full min-w-0 flex-1 basis-0 items-end',
    'xl:basis-auto xl:overflow-x-auto xl:overscroll-x-contain scrollbar-hidden',
    'touch:min-w-fit max-xl:min-w-fit',
  ),
  plate: cn(
    'pointer-events-none relative isolate flex h-full min-w-0 items-center justify-center',
    'gap-1 px-[calc(var(--plate-cut)+var(--plate-pad))] md:gap-1.5 xl:gap-2',
    '[--plate-cut:var(--plate-cut-free)] [--plate-e:calc(var(--plate-cut)*0.22)]',
  ),
  plateEdge: cn(
    'pointer-events-none absolute inset-0 -z-10 bg-hud-5/60',
    'dark:bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--plate-tone)_60%,transparent),var(--plate-tone))]',
  ),
  plateEdgeCapped:
    'bg-[var(--plate-tone)] [mask-image:linear-gradient(to_bottom,transparent_var(--shelf-y),#000_var(--shelf-y))]',
  plateBg: cn(
    'pointer-events-none absolute inset-x-px top-0 bottom-px -z-10',
    'bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--plate-tone)_10%,var(--header-bg)),var(--header-bg))]',
    'dark:bg-[radial-gradient(60%_110%_at_50%_0%,color-mix(in_srgb,var(--plate-tone)_24%,transparent),transparent_75%),linear-gradient(to_bottom,color-mix(in_srgb,var(--plate-tone)_14%,var(--color-bg-header-from)),var(--header-bg))]',
  ),
  plateBgSolid: cn(
    'pointer-events-none absolute inset-0 -z-10',
    'bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--plate-tone)_26%,var(--header-bg)),color-mix(in_srgb,var(--plate-tone)_10%,var(--header-bg)))]',
  ),
  plateTopBar: 'pointer-events-none absolute inset-x-0 top-0 -z-10 h-0.5 bg-[var(--plate-tone)]',
  plateRailSolid:
    'pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-0.5 bg-[var(--plate-tone)]',
  plateMark: 'pointer-events-none absolute inset-0 -z-10 bg-[var(--plate-tone)]',
  plateRail: 'pointer-events-none absolute inset-x-[14%] bottom-0 h-0.5',
  plateHandle: 'pointer-events-none absolute left-1/2 -translate-x-1/2',
  plateFlank: 'pointer-events-none absolute top-[22%] -z-10 flex items-center gap-[3px]',
  plateRule: cn(
    'pointer-events-none absolute inset-y-0 w-px',
    'bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--plate-tone)_70%,transparent)_45%,transparent)]',
  ),
  wing: 'relative hidden shrink-0 items-center gap-0.5 md:flex',
  wingBar: 'h-2.5 w-0.5 xl:h-3 xl:w-[3px] wide:h-3.5 wide:w-1',
  /** Nhiều tab (chế độ dày): bỏ cánh `///` ở md..2xl để dải tab không tràn ô nav. */
  wingDense: 'md:max-2xl:hidden!',
  wingGlow: 'dark:shadow-[0_0_6px_var(--plate-tone)]',
  railGlow: 'dark:shadow-[0_0_10px_var(--plate-tone)]',
  titleBlock:
    'pointer-events-auto relative flex min-w-0 flex-col items-center justify-center leading-none',
  title: cn(
    'relative block min-w-0 overflow-x-clip overflow-y-visible text-center text-ellipsis whitespace-nowrap text-fg-on-chrome',
    'dark:[text-shadow:0_1px_2px_var(--color-black-5),0_0_8px_color-mix(in_srgb,var(--plate-tone)_24%,transparent)]',
  ),
  subtitleRow: 'flex w-full min-w-0 items-center justify-center gap-1.5 max-xl:hidden',
  subtitleRule: cn(
    'h-px w-3 min-w-0 shrink-20 wide:w-4',
    'bg-[linear-gradient(var(--rule-dir),transparent,color-mix(in_srgb,var(--plate-tone)_70%,transparent))]',
  ),
  subtitle: cn(
    'block min-w-0 truncate text-center',
    'text-caption-10-medium leading-[1.3]! text-fg-on-nav-muted wide:text-caption-12-medium',
    'max-w-[12rem] xl:max-w-[13rem] 2xl:max-w-[15rem] wide:max-w-[19rem]',
  ),
} satisfies Record<PageHeaderSlot, string>;

/**
 * Ba đoạn của cụm vạch gạch–chấm hai bên bảng tên (xếp từ SÁT bảng tên ra ngoài): dài → vừa → chấm, mờ dần; đoạn sát bảng tên có
 * quầng (chỉ `dark:`). Cao 2px, đầu vuông — nét ở DPR 1.
 */
export const PAGE_HEADER_FLANK_SEGMENT_CLASSES = [
  'h-0.5 w-4 wide:w-5 bg-hud-4 dark:shadow-[0_0_6px_var(--color-hud-4)]',
  'h-0.5 w-2 bg-hud-4/60',
  'h-0.5 w-[3px] bg-hud-4/35',
] as const;

export const PAGE_HEADER_SIDE_CLASSES = {
  left: {
    navCell: 'justify-end-safe ps-2 md:pe-[var(--nav-pad)]',
    wing: 'flex-row-reverse md:ms-1 wide:ms-1',
    wingBar: '-skew-x-[20deg]',
    rule: '[--rule-dir:to_right]',
    flank: 'flex-row-reverse right-[calc(100%-var(--plate-e)-var(--plate-notch)+4px)]',
    plateRule: 'left-0',
  },
  right: {
    navCell: 'justify-start pe-2 md:ps-[var(--nav-pad)]',
    wing: 'md:me-1 wide:me-1',
    wingBar: 'skew-x-[20deg]',
    rule: '[--rule-dir:to_left]',
    flank: 'left-[calc(100%-var(--plate-e)-var(--plate-notch)+4px)]',
    plateRule: 'right-0',
  },
} satisfies Record<
  PageHeaderSide,
  Record<'navCell' | 'wing' | 'wingBar' | 'rule' | 'flank' | 'plateRule', string>
>;

/**
 * `sided` = cụm tâm có hai ô nav hai bên (sàn bề rộng + trần chặt hơn, bảng tên chui vào ô bên đúng `--plate-tuck`); `free` = chỉ có bảng tên.
 * HÌNH bảng tên giống nhau ở cả hai (`--plate-cut-sided`) — trang không có tab vẫn hiện như trang có tab.
 */
export const PAGE_HEADER_SIDED_CLASSES = {
  sided: {
    cluster: 'w-full',
    plate: 'md:-mx-[var(--plate-tuck)] md:[--plate-cut:var(--plate-cut-sided)]',
    titleBlock: 'min-w-[48px] md:min-w-[56px] xl:min-w-[64px] wide:min-w-[88px]',
    title: 'max-w-[9rem] lg:max-w-[11rem] xl:max-w-[13rem] wide:max-w-[20rem]',
  },
  free: {
    cluster: '',
    plate: 'md:[--plate-cut:var(--plate-cut-sided)]',
    titleBlock: '',
    title: 'max-w-[12rem] xl:max-w-[20rem] wide:max-w-[30rem]',
  },
} satisfies Record<PageHeaderLayout, Record<'cluster' | 'plate' | 'titleBlock' | 'title', string>>;

/** Cỡ chữ tiêu đề: bảng đầy đủ theo (cỡ × bậc `fit`) — ghi từng ô, không ghi đè bằng class phụ (tailwind-merge không phân biệt `text-*` tuỳ biến). */
export const PAGE_HEADER_SIZE_CLASSES = {
  md: {
    plate: '',
    title: {
      base: cn(
        'text-body-14-bold tracking-[0.01em]',
        'md:text-body-16-bold md:tracking-[0.02em]',
        'xl:tracking-[0.03em]',
        'wide:text-body-18-bold wide:tracking-[0.04em]',
      ),
      snug: cn(
        'text-body-14-bold tracking-[0.01em]',
        'xl:tracking-[0.02em]',
        'wide:text-body-16-bold wide:tracking-[0.03em]',
      ),
      tight: cn(
        'text-caption-12-bold tracking-[0.01em]',
        'xl:text-body-14-bold xl:tracking-[0.02em]',
      ),
    },
  },
  sm: {
    plate: 'gap-1 xl:gap-1.5',
    title: {
      base: cn(
        'text-caption-12-bold tracking-[0.01em]',
        'md:text-body-14-bold',
        'xl:tracking-[0.02em]',
        '2xl:text-body-16-bold',
        'wide:text-body-16-bold wide:tracking-[0.03em]',
      ),
      snug: cn(
        'text-caption-12-bold tracking-[0.01em]',
        'md:text-body-14-bold',
        'xl:tracking-[0.02em]',
      ),
      tight: cn('text-caption-10-bold tracking-[0.01em]', 'md:text-caption-12-bold'),
    },
  },
} satisfies Record<
  PageHeaderTitleSize,
  { plate: string; title: Record<PageHeaderTitleFit, string> }
>;

/** Ghép thêm vào `title` khi bảng tên CÓ dòng phụ (dòng phụ chỉ hiện từ `xl`, canh giữa cùng tiêu đề). */
export const PAGE_HEADER_SUBTITLE_CLASSES = {
  title: 'w-full text-center leading-[1.15]!',
} satisfies Record<'title', string>;
