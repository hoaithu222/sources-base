import { cn } from '@/shared/utils/style/cn';
import type { ButtonSkin } from '@/shared/ui/actions/button.types';
import type { SystemIconName } from '@/shared/ui/icons/Icons';
import type { GemColor } from '@/shared/ui/icons/gem-icon/GemIcon';
import type { ConfirmDialogVariant } from './confirm-dialog.types';

/**
 * confirm-dialog.theme — cấu hình variant + bảng class của ConfirmDialog (frame="hud", bố cục dọc căn giữa).
 *
 * Dùng:   CONFIRM_VARIANTS[variant] → màu / icon / nhãn · CONFIRM_DIALOG_CLASSES.<phần> → class từng phần
 * Trục:   variant confirm | delete | success | warning | info · số nút double | triple
 * Sửa:    màu theo variant → CONFIRM_VARIANTS · nền / glow → CONFIRM_DIALOG_CLASSES · 3 nút → CONFIRM_DIALOG_BUTTONS_CLASSES
 * Lưu ý:  khung giữ brand green (--hud); màu ngữ nghĩa CHỈ ở gem + nút hành động + quầng sau gem (--accent).
 *         Quầng / vệt kính / bóng màu của nút chỉ qua `dark:`; nút đặc tự khai giữ chữ trắng đọc được (bậc -7 trở xuống).
 *         `accent` phải là chuỗi tĩnh để Tailwind quét được. Lý do: notes/components/overlays.md#confirmdialog
 */

type ConfirmDialogWingSide = 'left' | 'right';
type ConfirmDialogButtons = 'double' | 'triple';

interface ConfirmVariantConfig {
  accent: string;
  gemColor: GemColor;
  icon: SystemIconName;
  iconCn: string;
  actionSkin?: ButtonSkin;
  /** Chỉ cho variant không có skin tương ứng của Button — phải khai cả `active:*`. */
  actionCn?: string;
  defaultLabel: string;
}

interface ConfirmButtonsClasses {
  width: string;
  actions: string;
  cancel: string;
  secondaryAction: string;
  action: string;
}

export const CONFIRM_VARIANTS = {
  confirm: {
    accent: '[--accent:var(--color-sky-5)]',
    gemColor: 'blue',
    icon: 'folder-outline',
    iconCn: 'size-full',
    actionSkin: 'base',
    defaultLabel: 'Xác nhận',
  },
  delete: {
    accent: '[--accent:var(--color-red-5)]',
    gemColor: 'red',
    icon: 'trash-can-outline',
    iconCn: 'size-full',
    actionSkin: 'danger',
    defaultLabel: 'Xóa',
  },
  success: {
    accent: '[--accent:var(--color-green-5)]',
    gemColor: 'green',
    icon: 'circle-check-outline',
    iconCn: 'size-full',
    actionCn: cn(
      'border-green-7 bg-green-7 text-neutral-0',
      'hover:bg-green-8 hover:border-green-8',
      'active:bg-green-9 active:border-green-9',
    ),
    defaultLabel: 'Xác nhận',
  },
  warning: {
    accent: '[--accent:var(--color-yellow-5)]',
    gemColor: 'yellow',
    icon: 'triangle-exclamation-outline',
    iconCn: 'size-full',
    actionCn: cn(
      'border-yellow-7 bg-yellow-7 text-neutral-0',
      'hover:bg-yellow-8 hover:border-yellow-8',
      'active:bg-yellow-9 active:border-yellow-9',
    ),
    defaultLabel: 'Tiếp tục',
  },
  info: {
    accent: '[--accent:var(--color-sky-5)]',
    gemColor: 'blue',
    icon: 'circle-exclamation-outline',
    iconCn: 'size-full',
    actionSkin: 'base',
    defaultLabel: 'OK',
  },
} satisfies Record<ConfirmDialogVariant, ConfirmVariantConfig>;

/** Class từng phần của dialog; ghép với `CONFIRM_DIALOG_BUTTONS_CLASSES` cho 3 nút. */
export const CONFIRM_DIALOG_CLASSES = {
  root: cn(
    'relative flex flex-col items-center gap-4 px-6 pb-5 pt-7 text-center',
    '[@media(max-height:540px)]:max-h-[calc(100dvh-16px)] [@media(max-height:540px)]:overflow-y-auto',
    '[@media(max-height:540px)]:overscroll-contain',
  ),
  aura: cn(
    'pointer-events-none absolute -top-16 left-1/2 size-[260px] -translate-x-1/2 rounded-full',
    'bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_26%,transparent),transparent_66%)]',
    'opacity-30 blur-[28px] dark:opacity-80',
  ),
  counterGlow: cn(
    'pointer-events-none absolute -bottom-24 left-1/2 hidden h-[220px] w-[420px] -translate-x-1/2 rounded-[50%]',
    'bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--color-teal-5)_12%,transparent),transparent_70%)]',
    'opacity-90 blur-[32px] dark:block [@media(max-height:540px)]:hidden!',
  ),
  sheen: cn(
    'pointer-events-none absolute inset-x-0 top-0 hidden h-28 dark:block',
    'bg-[linear-gradient(115deg,transparent_36%,color-mix(in_srgb,var(--color-neutral-0)_7%,transparent)_50%,transparent_64%)]',
  ),
  close: 'right-3 top-3 z-20',
  gemRow: 'relative flex items-center justify-center gap-4',
  titleGroup: 'flex flex-col items-center gap-2',
  title: 'text-h4-semibold text-fg-on-chrome',
  description: 'max-w-[40ch] text-body-14 text-fg-on-chrome-muted',
  divider: 'h-px w-full bg-gradient-to-r from-transparent via-border-strong to-transparent',
  tipRow: 'flex flex-wrap items-center justify-center gap-x-2 gap-y-1',
  tipIcon: 'text-action-base',
  tipLabel: 'text-body-14-medium text-action-base',
  tipText: 'text-body-14 text-fg-on-chrome-muted',
  actions: 'flex w-full phone:flex-col-reverse phone:gap-2',
  cancel: 'flex-1',
  secondaryAction: 'flex-1',
  action: 'flex-1 dark:shadow-[0_0_22px_-6px_color-mix(in_srgb,var(--accent)_75%,transparent)]',
};

export const CONFIRM_DIALOG_WING_CLASSES = {
  left: 'pointer-events-none h-[2px] w-12 shrink-0 bg-gradient-to-r from-transparent to-[var(--hud,var(--color-primary-5))]',
  right:
    'pointer-events-none h-[2px] w-12 shrink-0 bg-gradient-to-l from-transparent to-[var(--hud,var(--color-primary-5))]',
} satisfies Record<ConfirmDialogWingSide, string>;

export const CONFIRM_DIALOG_BUTTONS_CLASSES = {
  double: {
    width: 'w-[460px]',
    actions: 'gap-3',
    cancel: '',
    secondaryAction: '',
    action: '',
  },
  triple: {
    width: 'w-[540px]',
    actions: 'gap-2',
    cancel: 'whitespace-nowrap',
    secondaryAction: 'whitespace-nowrap',
    action: 'whitespace-nowrap',
  },
} satisfies Record<ConfirmDialogButtons, ConfirmButtonsClasses>;
