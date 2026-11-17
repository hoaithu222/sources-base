import type { Locale } from '@/core/i18n';
import type {
  AvatarSize,
  BadgeColor,
  BadgeSize,
  BadgeVariant,
  ButtonSize,
  ButtonSkin,
  ButtonVariant,
  CalloutIntent,
  ConfirmDialogVariant,
  ProgressVariant,
  SkeletonVariant,
  SpinnerColor,
  SpinnerSize,
  ToastType,
} from '@/shared/ui';

import type { CatalogFormValues } from './catalog.schema';
import type { CatalogFormState, CatalogRow } from './catalog.types';

/**
 * Dữ liệu mẫu của các ví dụ catalog — KHÔNG có chữ hiển thị cho người dùng: tên riêng dùng chữ Latin không dấu, nhãn
 * dịch đi qua `messages/<locale>/demo.json` (id ở đây là khoá tra). Ngày dựng bằng `new Date(y, m, d)` (giờ địa phương)
 * để HTML server và client giống nhau.
 */

export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'stroke',
  'ghost',
] as const satisfies readonly ButtonVariant[];
export const BUTTON_SKINS = [
  'base',
  'accent',
  'danger',
  'neutral',
] as const satisfies readonly ButtonSkin[];
export const BUTTON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies readonly ButtonSize[];

export const BADGE_COLORS = [
  'primary',
  'secondary',
  'accent',
  'info',
  'indigo',
  'success',
  'warning',
  'error',
  'neutral',
] as const satisfies readonly BadgeColor[];
export const BADGE_VARIANTS = [
  'tinted',
  'solid',
  'outline',
  'disabled',
] as const satisfies readonly BadgeVariant[];
export const BADGE_SIZES = ['lg', 'md', 'sm', 'xs'] as const satisfies readonly BadgeSize[];
export const BADGE_TAG_IDS = ['design', 'review', 'release'] as const;
export const AVATAR_NAMES = ['Base App', 'Next JS', 'Alice Tran'] as const;

export const CALLOUT_INTENTS = [
  'info',
  'success',
  'warning',
  'error',
  'neutral',
] as const satisfies readonly CalloutIntent[];

export const PROGRESS_VARIANTS = [
  'primary',
  'success',
  'warning',
  'error',
  'neutral',
] as const satisfies readonly ProgressVariant[];
export const PROGRESS_STEP = 10;
export const PROGRESS_INITIAL = 40;

export const DEPARTMENT_IDS = ['hr', 'finance', 'sales', 'it', 'legal', 'ops'] as const;
export const DEPARTMENT_CODES = {
  hr: 'HR',
  finance: 'FIN',
  sales: 'SAL',
  it: 'IT',
  legal: 'LEG',
  ops: 'OPS',
} as const satisfies Record<(typeof DEPARTMENT_IDS)[number], string>;

export const FORM_STATE_ORDER = [
  'default',
  'invalid',
  'readOnly',
  'disabled',
] as const satisfies readonly CatalogFormState[];

export const FORM_SAMPLE_VALUES = {
  default: { name: '', password: '', quantity: 1 },
  invalid: { name: '', password: '123', quantity: 99 },
  readOnly: { name: 'Alice Tran', password: 'secret-123', quantity: 3 },
  disabled: { name: 'Alice Tran', password: 'secret-123', quantity: 3 },
} as const satisfies Record<CatalogFormState, CatalogFormValues>;

export const PICKER_DATE_FORMAT = {
  vi: 'DD/MM/YYYY',
  en: 'MM/DD/YYYY',
} as const satisfies Record<Locale, string>;
export const PICKER_SAMPLE_DATE = new Date(2026, 6, 15);
export const PICKER_SAMPLE_DATE_TIME = new Date(2026, 6, 15, 9, 30);
export const PICKER_SAMPLE_TIME = '09:30';
export const PICKER_MIN_DATE = new Date(2026, 6, 6);
export const PICKER_MAX_DATE = new Date(2026, 6, 24);

export const TABLE_PAGE_SIZES = [5, 10];

export const TABLE_SAMPLE_ROWS: readonly CatalogRow[] = [
  {
    id: '1',
    code: 'KH-001',
    name: 'Alice Tran',
    amount: 12500000,
    status: 'active',
    date: '2026-07-01',
  },
  {
    id: '2',
    code: 'KH-002',
    name: 'Bao Nguyen',
    amount: 8300000,
    status: 'active',
    date: '2026-07-02',
  },
  {
    id: '3',
    code: 'KH-003',
    name: 'Chi Le',
    amount: 450000,
    status: 'inactive',
    date: '2026-07-03',
  },
  {
    id: '4',
    code: 'KH-004',
    name: 'Dung Pham',
    amount: 19800000,
    status: 'active',
    date: '2026-07-04',
  },
  {
    id: '5',
    code: 'KH-005',
    name: 'Emma Vo',
    amount: 2750000,
    status: 'inactive',
    date: '2026-07-05',
  },
  {
    id: '6',
    code: 'KH-006',
    name: 'Felix Hoang',
    amount: 6100000,
    status: 'active',
    date: '2026-07-06',
  },
  {
    id: '7',
    code: 'KH-007',
    name: 'Giang Bui',
    amount: 990000,
    status: 'active',
    date: '2026-07-07',
  },
  {
    id: '8',
    code: 'KH-008',
    name: 'Hana Dang',
    amount: 15400000,
    status: 'inactive',
    date: '2026-07-08',
  },
  {
    id: '9',
    code: 'KH-009',
    name: 'Ivan Do',
    amount: 3200000,
    status: 'active',
    date: '2026-07-09',
  },
  {
    id: '10',
    code: 'KH-010',
    name: 'Julia Ngo',
    amount: 7800000,
    status: 'active',
    date: '2026-07-10',
  },
  {
    id: '11',
    code: 'KH-011',
    name: 'Khoa Ly',
    amount: 560000,
    status: 'inactive',
    date: '2026-07-11',
  },
  {
    id: '12',
    code: 'KH-012',
    name: 'Lan Truong',
    amount: 11200000,
    status: 'active',
    date: '2026-07-12',
  },
];

export const SEGMENT_OPTION_IDS = ['day', 'week', 'month'] as const;
export const TOGGLE_SIZES = ['sm', 'md', 'lg'] as const;

export const CONFIRM_VARIANTS = [
  'confirm',
  'delete',
  'warning',
] as const satisfies readonly ConfirmDialogVariant[];
export const TOAST_TYPES = [
  'success',
  'error',
  'warning',
  'info',
] as const satisfies readonly ToastType[];

export const TABLE_VIEW_IDS = ['data', 'loading', 'empty'] as const;

export const AVATAR_SIZES = ['sm', 'md', 'lg', 'xl'] as const satisfies readonly AvatarSize[];
export const SPINNER_SIZES = ['sm', 'md', 'lg'] as const satisfies readonly SpinnerSize[];
export const SPINNER_COLORS = [
  'primary',
  'info',
  'success',
  'warning',
  'danger',
  'neutral',
] as const satisfies readonly SpinnerColor[];
export const SKELETON_VARIANTS = [
  'text',
  'rectangle',
  'circle',
] as const satisfies readonly SkeletonVariant[];
export const PROGRESS_VARIANT_SAMPLE = 64;
