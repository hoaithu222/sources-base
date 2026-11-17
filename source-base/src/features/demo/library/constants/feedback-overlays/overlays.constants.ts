import type {
  ConfirmDialogVariant,
  DrawerSide,
  DrawerSize,
  FormModalSize,
  ModalFrame,
  ModalSize,
  PopoverVariant,
  TooltipVariant,
} from '@/shared/ui';

/**
 * Trục biến thể của mục "Lớp nổi", "Hộp thoại" và "Hộp thoại nhập liệu"
 * (Tooltip · Popover · Modal · Drawer · ConfirmDialog · FormModal).
 */

const MODAL_SIZES: readonly ModalSize[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  'auto',
  'screen',
  'full',
];

/** Preset cho `<Modal>` demo — 1 nút = 1 giá trị, cùng pattern với ConfirmDialog variant. */
export interface ModalDemoPreset {
  key: string;
  label: string;
  size?: ModalSize;
  frame?: ModalFrame;
  showClose?: boolean;
  loading?: boolean;
  noPadding?: boolean;
  /** Component tự dựng footer tuỳ biến khi cờ này bật — data ở đây chỉ mang flag. */
  customFooter?: boolean;
}

export const MODAL_SIZE_DEMOS: readonly ModalDemoPreset[] = MODAL_SIZES.map((size) => ({
  key: size,
  label: `size="${size}"`,
  size,
}));

export const MODAL_AXIS_DEMOS: readonly ModalDemoPreset[] = [
  { key: 'frame-hud', label: 'frame="hud"', frame: 'hud', size: 'sm' },
  { key: 'no-close', label: 'showClose=false', showClose: false },
  { key: 'loading', label: 'loading=true', loading: true },
  { key: 'no-padding', label: 'noPadding=true', noPadding: true },
  { key: 'footer', label: 'footer tuỳ biến', customFooter: true },
];

export const TOOLTIP_SIDES = ['top', 'right', 'bottom', 'left'] as const;
export const TOOLTIP_ALIGNS = ['start', 'center', 'end'] as const;
export const TOOLTIP_VARIANTS: readonly TooltipVariant[] = ['hint', 'data'];

export const POPOVER_VARIANTS: readonly PopoverVariant[] = ['glass', 'solid'];
export const POPOVER_SIDES = ['top', 'right', 'bottom', 'left'] as const;
export const POPOVER_ALIGNS = ['start', 'center', 'end'] as const;

export const CONFIRM_VARIANTS: readonly ConfirmDialogVariant[] = [
  'confirm',
  'delete',
  'success',
  'warning',
  'info',
];

const FORM_MODAL_SIZES: readonly FormModalSize[] = ['sm', 'md', 'lg', 'xl'];
export const FORM_MODAL_SIZE_OPTIONS = FORM_MODAL_SIZES.map((s) => ({ key: s, label: s }));

const DRAWER_SIDES: readonly DrawerSide[] = ['right', 'left', 'top', 'bottom'];
export const DRAWER_SIDE_OPTIONS = DRAWER_SIDES.map((s) => ({ key: s, label: s }));
const DRAWER_SIZES: readonly DrawerSize[] = ['sm', 'md', 'lg', 'xl'];
export const DRAWER_SIZE_OPTIONS = DRAWER_SIZES.map((s) => ({ key: s, label: s }));
