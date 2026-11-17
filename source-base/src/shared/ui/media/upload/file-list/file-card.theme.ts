import { cn } from '@/shared/utils/style/cn';
import type { ButtonSkin } from '@/shared/ui/actions/button.types';
import type { SystemIconName } from '@/shared/ui/icons/Icons';
import { HUD_HOVER_GLOW } from '@/shared/ui/primitives/hud.theme';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type {
  FileBadgeSize,
  FileBadgeSkin,
  FileCardActionTone,
  FileCardDensity,
  UploadFileStatus,
} from '../upload.types';

/**
 * file-card.theme — bảng class cho FileCard (một hàng của FileList) và FileBadge (ô loại tệp).
 *
 * Trục:   status pending | uploading | paused | success | error → FILE_CARD_STATUS_TONES[status]
 *         (icon · vạch trái 2px · thanh tiến độ · màu chữ) · density cozy | compact
 *         · tone nút neutral | danger | primary · skin badge red | blue | … | neutral (theo đuôi tệp)
 * Sửa:    trạng thái → FILE_CARD_STATUS_TONES · đệm → FILE_CARD_DENSITY_CLASSES · cỡ tên →
 *         FILE_CARD_NAME_DENSITY_CLASSES · nút → FILE_CARD_ACTION_* · badge → FILE_BADGE_*
 * Lưu ý:  vạch trái + thanh tiến độ ĐÈ lên viền thẻ (`-left-px` / `-bottom-px`) nên thẻ phải `relative`.
 *         Theme tối: nền thẻ dốc ngang nhuộm màu trạng thái từ mép trái (nơi vạch phát sáng) — `root` của từng tone.
 *         Ramp KHÔNG lật theme: bậc `-1` / `-6` / `-7` cho nền sáng phải kèm `dark:`.
 *         Kiểu trục khai ở upload.types.ts (barrel `media/upload` xuất lại).
 */

interface FileCardStatusTone {
  /** Icon đứng trước nhãn trạng thái. */
  icon: SystemIconName;
  /** Khung thẻ: viền · nền · hover. */
  root: string;
  /** Vạch dọc 2px ở mép trái. */
  accent: string;
  /** Màu icon + nhãn + % của trạng thái. */
  tone: string;
  /** Chuyển động của icon (xoay khi đang tải). */
  motion: string;
  /** `true` → vẽ thanh tiến độ ở đáy thẻ (khi `showProgressBar`). */
  bar: boolean;
  track: string;
  fill: string;
}

export const FILE_CARD_BASE_CLASSES = cn(
  'relative flex w-full min-w-0 items-center border',
  'transition-[background-color,border-color] duration-150 ease-out',
);

export const FILE_CARD_INTERACTIVE_CLASSES = cn(
  'cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  HUD_HOVER_GLOW,
);

export const FILE_CARD_DENSITY_CLASSES = {
  cozy: 'gap-3 px-3 py-2.5',
  compact: 'gap-2 px-2.5 py-1.5',
} satisfies Record<FileCardDensity, string>;

export const FILE_CARD_NAME_DENSITY_CLASSES = {
  cozy: 'text-body-14-medium',
  compact: 'text-body-13-medium',
} satisfies Record<FileCardDensity, string>;

/** Cỡ `FileBadge` theo `density` của thẻ. */
export const FILE_CARD_BADGE_SIZES = {
  cozy: 'md',
  compact: 'sm',
} satisfies Record<FileCardDensity, FileBadgeSize>;

export const FILE_CARD_STATUS_TONES = {
  pending: {
    icon: 'clock-outline',
    root: cn(
      'border-border-default bg-bg-input hover:bg-bg-nav-hover',
      'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-sky-5)_8%,transparent),transparent_55%)]',
    ),
    accent: 'bg-border-strong',
    tone: 'text-fg-muted',
    motion: '',
    bar: true,
    track:
      'bg-[repeating-linear-gradient(90deg,var(--color-border-strong)_0_4px,transparent_4px_8px)]',
    fill: 'bg-transparent',
  },
  uploading: {
    icon: 'loader-outline',
    root: cn(
      'border-border-default bg-bg-input hover:bg-bg-nav-hover dark:border-primary-5/30',
      'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-5)_14%,transparent),transparent_60%)]',
    ),
    accent: cn(
      'bg-primary-5',
      'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
    ),
    tone: 'text-link',
    motion: 'animate-spin motion-reduce:animate-none',
    bar: true,
    track: 'bg-bg-track',
    fill: cn(
      'bg-linear-to-r from-primary-5/45 to-primary-5',
      'dark:to-primary-4 dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-5)_45%,transparent)]',
    ),
  },
  paused: {
    icon: 'circle-pause-outline',
    root: cn(
      'border-border-default bg-bg-input hover:bg-bg-nav-hover',
      'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-warning)_10%,transparent),transparent_55%)]',
    ),
    accent: cn(
      'bg-warning',
      'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-warning)_60%,transparent)]',
    ),
    tone: 'text-warning-7 dark:text-warning',
    motion: '',
    bar: true,
    track: 'bg-bg-track',
    fill: cn(
      'bg-linear-to-r from-warning/45 to-warning',
      'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-warning)_45%,transparent)]',
    ),
  },
  success: {
    icon: 'circle-check-bold',
    root: cn(
      'border-border-default bg-bg-input hover:bg-bg-nav-hover',
      'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-success)_9%,transparent),transparent_55%)]',
    ),
    accent: cn(
      'bg-success',
      'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-success)_55%,transparent)]',
    ),
    tone: 'text-success-7 dark:text-success',
    motion: '',
    bar: false,
    track: '',
    fill: '',
  },
  error: {
    icon: 'circle-xmark-bold',
    root: cn(
      'border-error/40 bg-error/5 hover:bg-error/8',
      'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-error)_14%,transparent),transparent_60%)]',
    ),
    accent: cn(
      'bg-error',
      'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-error)_65%,transparent)]',
    ),
    tone: 'text-error',
    motion: '',
    bar: false,
    track: '',
    fill: '',
  },
} satisfies Record<UploadFileStatus, FileCardStatusTone>;

export const FILE_CARD_ACCENT_CLASSES = 'pointer-events-none absolute -inset-y-px -left-px w-0.5';

export const FILE_CARD_PROGRESS_TRACK_CLASSES =
  'pointer-events-none absolute inset-x-0 -bottom-px h-0.5';

export const FILE_CARD_PROGRESS_FILL_CLASSES = cn(
  'relative block h-full overflow-hidden',
  'transition-[width] duration-300 ease-out motion-reduce:transition-none',
);

export const FILE_CARD_PROGRESS_SHINE_CLASSES = cn(
  'absolute inset-0 [transform:translateX(-100%)]',
  'bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-neutral-0)_60%,transparent),transparent)]',
  'animate-[progress-shine_1.6s_ease-in-out_infinite] motion-reduce:animate-none',
);

export const FILE_CARD_BODY_CLASSES = 'flex min-w-0 flex-1 flex-col gap-0.5';

export const FILE_CARD_NAME_CLASSES = cn(TEXT_ELLIPSIS_CLASSES, 'text-fg-heading');

export const FILE_CARD_META_CLASSES =
  'flex min-w-0 items-center gap-1.5 text-caption-12 tabular-nums text-fg-muted';

export const FILE_CARD_STATUS_LABEL_CLASSES = 'inline-flex min-w-0 items-center gap-1';

export const FILE_CARD_PERCENT_CLASSES = 'shrink-0 text-caption-12-medium tabular-nums';

export const FILE_CARD_ACTIONS_CLASSES = 'flex shrink-0 items-center gap-1';

export const FILE_CARD_ACTION_BASE_CLASSES = cn(
  'relative size-7 px-0 py-0 focus-visible:ring-inset',
  "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-2 touch:after:content-['']",
);

export const FILE_CARD_ACTION_TONE_CLASSES = {
  neutral: 'text-fg-muted',
  danger: 'text-fg-muted hover:bg-error/10 hover:text-error active:bg-error/20',
  primary: 'text-action-base',
} satisfies Record<FileCardActionTone, string>;

/** Skin của `<Button variant="ghost">` cho từng tone nút trong thẻ. */
export const FILE_CARD_ACTION_SKINS = {
  neutral: 'neutral',
  danger: 'neutral',
  primary: 'base',
} satisfies Record<FileCardActionTone, ButtonSkin>;

export const FILE_BADGE_BASE_CLASSES = cn(
  'relative inline-flex shrink-0 flex-col items-center justify-center gap-0.5',
  'overflow-hidden border',
);

export const FILE_BADGE_SIZE_CLASSES = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
} satisfies Record<FileBadgeSize, string>;

/** Cỡ icon (px) theo `size`, truyền vào `<SystemIcon size>`. */
export const FILE_BADGE_ICON_PX = {
  sm: 14,
  md: 16,
  lg: 20,
} satisfies Record<FileBadgeSize, number>;

export const FILE_BADGE_SKIN_CLASSES = {
  red: cn(
    'border-red-6/20 bg-red-1 text-red-6',
    'dark:border-red-5/30 dark:bg-red-5/15 dark:text-red-4',
  ),
  blue: cn(
    'border-blue-6/20 bg-blue-1 text-blue-6',
    'dark:border-blue-5/30 dark:bg-blue-5/15 dark:text-blue-4',
  ),
  green: cn(
    'border-green-7/20 bg-green-1 text-green-7',
    'dark:border-green-5/30 dark:bg-green-5/15 dark:text-green-4',
  ),
  orange: cn(
    'border-orange-6/20 bg-orange-2/40 text-orange-6',
    'dark:border-orange-5/30 dark:bg-orange-5/15 dark:text-orange-4',
  ),
  purple: cn(
    'border-purple-6/20 bg-purple-1 text-purple-6',
    'dark:border-purple-5/30 dark:bg-purple-5/15 dark:text-purple-4',
  ),
  sky: cn(
    'border-sky-7/20 bg-sky-1 text-sky-7',
    'dark:border-sky-5/30 dark:bg-sky-5/15 dark:text-sky-4',
  ),
  neutral: 'border-border-default bg-bg-subtle text-fg-muted',
} satisfies Record<FileBadgeSkin, string>;

export const FILE_BADGE_PREVIEW_CLASSES = 'border-border-default bg-bg-subtle';

export const FILE_BADGE_LABEL_BASE_CLASSES = 'px-0.5 text-caption-9-bold uppercase';

export const FILE_BADGE_LABEL_SKIN_CLASSES = {
  red: 'bg-red-6 text-neutral-0',
  blue: 'bg-blue-6 text-neutral-0',
  green: 'bg-green-7 text-neutral-0',
  orange: 'bg-orange-7 text-neutral-0',
  purple: 'bg-purple-6 text-neutral-0',
  sky: 'bg-sky-7 text-neutral-0',
  neutral: 'bg-neutral-7 text-neutral-0',
} satisfies Record<FileBadgeSkin, string>;
