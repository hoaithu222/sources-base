import { cn } from '@/shared/utils/style/cn';
import type { ButtonSkin } from '@/shared/ui/actions/button.types';
import type { SystemIconName } from '@/shared/ui/icons/Icons';
import type { GemColor } from '@/shared/ui/icons/gem-icon/GemIcon';
import type { ConfirmDialogVariant } from './confirm-dialog.types';

/**
 * confirm-dialog.theme — cấu hình variant + bảng class của ConfirmDialog (bố cục dọc căn giữa trên khung `Modal`).
 *
 * Dùng:   CONFIRM_VARIANTS[variant] → màu / icon / nhãn · CONFIRM_DIALOG_CLASSES.<phần> → class từng phần
 * Trục:   variant confirm | delete | success | warning | info · số nút double | triple
 * Sửa:    màu theo variant → CONFIRM_VARIANTS · bố cục → CONFIRM_DIALOG_CLASSES · 3 nút → CONFIRM_DIALOG_BUTTONS_CLASSES
 * Lưu ý:  màu ngữ nghĩa CHỈ ở gem (ô icon tông nhạt) + nút hành động; nút đặc tự khai giữ chữ trắng đọc được (bậc -7 trở xuống).
 *         Lý do: notes/components/overlays.md#confirmdialog
 */

type ConfirmDialogButtons = 'double' | 'triple';

interface ConfirmVariantConfig {
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
    gemColor: 'blue',
    icon: 'folder-outline',
    iconCn: 'size-full',
    actionSkin: 'base',
    defaultLabel: 'Xác nhận',
  },
  delete: {
    gemColor: 'red',
    icon: 'trash-can-outline',
    iconCn: 'size-full',
    actionSkin: 'danger',
    defaultLabel: 'Xóa',
  },
  success: {
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
  cancel: 'flex-1 rounded-2xl',
  secondaryAction: 'flex-1 rounded-2xl',
  action: 'flex-1 rounded-2xl',
};

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
