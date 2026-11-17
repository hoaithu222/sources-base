import type {
  ConfirmDialogVariant,
  DrawerSide,
  DrawerSize,
  FormModalSize,
  MenuOption,
  ModalSize,
  PopoverVariant,
  SystemIconName,
  TooltipVariant,
} from '@/shared/ui';

/**
 * Trục biến thể của mục "Lớp nổi", "Hộp thoại" và "Hộp thoại nhập liệu"
 * (Tooltip · Popover · Menu · Modal · Drawer · ConfirmDialog · FormModal).
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

/** Mục menu demo: `iconName` thay cho node `icon` (file hằng không chứa JSX — section tự đổi sang `<SystemIcon>`). */
export type MenuDemoItem = Omit<MenuOption, 'icon' | 'children'> & {
  iconName?: SystemIconName;
  children?: MenuDemoItem[];
};

/** Menu "đầy đủ" kiểu macOS: phím tắt · submenu lựa chọn đơn · vạch ngăn nhóm · mục khoá · mục phá huỷ ở nhóm cuối. */
export const MENU_RICH_ITEMS: readonly MenuDemoItem[] = [
  { key: 'open', label: 'Mở chi tiết', iconName: 'eye-outline', shortcut: 'Enter' },
  { key: 'edit', label: 'Sửa', iconName: 'pen-outline', shortcut: 'Ctrl+E' },
  { key: 'copy', label: 'Nhân bản', iconName: 'copy-outline', shortcut: 'Ctrl+D' },
  {
    key: 'status',
    label: 'Chuyển trạng thái',
    iconName: 'arrow-right-arrow-left-outline',
    children: [
      { key: 'draft', label: 'Nháp', checked: false },
      { key: 'doing', label: 'Đang làm', checked: true },
      { key: 'done', label: 'Hoàn thành', checked: false },
    ],
  },
  {
    key: 'export',
    label: 'Xuất Excel',
    iconName: 'arrow-down-to-bracket-outline',
    separatorBefore: true,
  },
  { key: 'share', label: 'Chia sẻ liên kết', iconName: 'link-outline', shortcut: 'Ctrl+L' },
  {
    key: 'lock',
    label: 'Khoá',
    iconName: 'lock-outline',
    disabled: true,
    hint: 'Cần quyền quản trị',
  },
  {
    key: 'delete',
    label: 'Xoá',
    iconName: 'trash-outline',
    danger: true,
    shortcut: 'Del',
    separatorBefore: true,
  },
];
