import type { DropdownOption, MultiSelectOption, TreeNodeData } from '@/shared/ui';

/**
 * Dữ liệu giả dùng chung cho NHIỀU nhóm của trang Demo (vd Chọn danh sách + Hệ form, Chọn danh sách + Cây).
 * Dữ liệu chỉ một nhóm dùng nằm ở `constants/<nhóm>/`.
 * Lưu ý: mảng CỐ Ý không `readonly` — prop UI kit (`Table.data`, `Tree.data`, `Dropdown.options`, `data`
 * của Recharts) nhận `T[]`; `readonly` buộc nơi dùng viết `[...X]`, sinh mảng mới mỗi render và phá `memo`.
 */

export const DEMO_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: 'm', label: 'Mét dài', badge: 'md', meta: 'chiều dài' },
  { value: 'm2', label: 'Mét vuông', badge: 'm²', meta: 'diện tích' },
  { value: 'm3', label: 'Mét khối', badge: 'm³', meta: 'thể tích' },
  { value: 'kg', label: 'Ki-lô-gam', badge: 'kg', meta: 'khối lượng' },
  { value: 'set', label: 'Bộ', badge: 'bộ', meta: 'số lượng' },
  { value: 'na', label: 'Chưa xác định', disabled: true },
];

export const DEMO_MULTISELECT_OPTIONS: MultiSelectOption[] = [
  { value: 'civil', label: 'Kết cấu' },
  { value: 'mep', label: 'Cơ điện' },
  { value: 'arch', label: 'Kiến trúc' },
  { value: 'infra', label: 'Hạ tầng' },
  { value: 'land', label: 'Cảnh quan' },
];

export const DEMO_TREE_DATA: TreeNodeData[] = [
  {
    id: 'p1',
    name: 'Dự án Khu đô thị A',
    icon: 'folder-outline',
    children: [
      {
        id: 'p1-1',
        name: 'Toà tháp T1',
        icon: 'folder-outline',
        children: [
          { id: 'p1-1-1', name: 'Bản vẽ kết cấu.pdf', icon: 'file-outline' },
          { id: 'p1-1-2', name: 'Bản vẽ cơ điện.pdf', icon: 'file-outline' },
        ],
      },
      { id: 'p1-2', name: 'Toà tháp T2', icon: 'folder-outline', children: [] },
      { id: 'p1-3', name: 'Hạ tầng kỹ thuật', disabled: true, icon: 'folder-outline' },
    ],
  },
  {
    id: 'p2',
    name: 'Dự án Cầu vượt B',
    icon: 'folder-outline',
    children: [{ id: 'p2-1', name: 'Hồ sơ nghiệm thu.pdf', icon: 'file-outline' }],
  },
];

/** Preset màu cho `ColorPalettePanel` / `ColorPickerField` — trùng token brand thường dùng. */
export const DEMO_COLOR_PRESET = [
  '#22C55E',
  '#1A94FF',
  '#FC820A',
  '#FF424E',
  '#A855F7',
  '#2DD4BF',
  '#F472B6',
  '#818CF8',
] as const;

/** Hex "đã bị chiếm" — minh hoạ nút khoá + dấu ✕ trong lưới preset (prop `usedColors`). */
export const DEMO_USED_COLORS = ['#1A94FF', '#FC820A'] as const;
