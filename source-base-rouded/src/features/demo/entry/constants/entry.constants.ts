import type { DropdownOption, SegmentOption, TableEntryDensity } from '@/shared/ui';

/**
 * Dữ liệu mẫu của màn `/demo/nhap-lieu` ("Phiếu nhập kho" — bảng nhập liệu). Hằng tĩnh, không random: bài kiểm và ảnh chụp
 * so sánh phải ổn định. Tiền: VND, không phần lẻ; số lượng: tối đa 3 chữ số lẻ.
 */

export interface EntryRow {
  id: string;
  code: string;
  name: string;
  unit: string;
  qty: number | null;
  price: number | null;
  note: string;
  /** Dòng mới thêm, chưa lưu lần nào. */
  draft?: boolean;
}

/** Trường người dùng sửa được — khoá của `dirty` / `errors`. */
export type EntryField = 'code' | 'name' | 'unit' | 'qty' | 'price' | 'note';

export const ENTRY_UNIT_OPTIONS: DropdownOption[] = [
  { value: 'kg', label: 'kg' },
  { value: 'tan', label: 'tấn' },
  { value: 'm3', label: 'm³' },
  { value: 'cai', label: 'cái' },
  { value: 'bo', label: 'bộ' },
  { value: 'cuon', label: 'cuộn' },
];

export const ENTRY_SEED_ROWS: readonly EntryRow[] = [
  {
    id: 'r1',
    code: 'THEP-D16',
    name: 'Thép thanh vằn D16 CB400',
    unit: 'tan',
    qty: 12.5,
    price: 15_850_000,
    note: 'Lô 10/2026',
  },
  {
    id: 'r2',
    code: 'THEP-D25',
    name: 'Thép thanh vằn D25 CB500',
    unit: 'tan',
    qty: 8,
    price: 16_200_000,
    note: '',
  },
  {
    id: 'r3',
    code: 'XM-PCB40',
    name: 'Xi măng PCB40 bao 50 kg',
    unit: 'tan',
    qty: 40,
    price: 1_620_000,
    note: 'Giao 2 đợt',
  },
  {
    id: 'r4',
    code: 'CAT-VANG',
    name: 'Cát vàng hạt to',
    unit: 'm3',
    qty: 85,
    price: 420_000,
    note: '',
  },
  { id: 'r5', code: 'DA-1X2', name: 'Đá dăm 1×2', unit: 'm3', qty: 120, price: 385_000, note: '' },
  {
    id: 'r6',
    code: 'CAP-15.2',
    name: 'Cáp dự ứng lực 15,2 mm',
    unit: 'cuon',
    qty: 6,
    price: 38_500_000,
    note: 'Kiểm CO/CQ',
  },
];

export const ENTRY_DENSITY_OPTIONS: SegmentOption[] = [
  { key: 'compact', label: 'Gọn' },
  { key: 'regular', label: 'Vừa' },
  { key: 'comfortable', label: 'Thoáng' },
] satisfies (SegmentOption & { key: TableEntryDensity })[];

/** Phím tắt hiện ở chân panel — một nguồn với hành vi thật của màn. */
export const ENTRY_KEY_HINTS = [
  { keys: '← →', label: 'đi trong dòng' },
  { keys: 'Enter', label: 'xuống dòng' },
  { keys: 'Shift+Enter', label: 'lên dòng' },
  { keys: 'Ctrl+S', label: 'lưu' },
] as const;
