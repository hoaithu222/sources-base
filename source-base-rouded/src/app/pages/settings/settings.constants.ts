import { ACCENT_COLORS, type AccentColor } from '@/domains/preferences';
import type { ChoiceTileOption } from '@/shared/ui';
import { formatShortcut } from '@/shared/utils/browser/shortcut-label.utils';
import { COMMAND_PALETTE_SHORTCUT_LABEL } from '@/shared/widgets/command-palette';

/** Tên + màu chấm của từng Màu nhấn (thứ tự theo `ACCENT_COLORS`, như dải Accent color của macOS). */
const ACCENT_META = {
  vci: { label: 'VCI', fill: 'bg-linear-to-br from-green-6 via-teal-7 to-secondary-7' },
  blue: { label: 'Xanh dương', fill: 'bg-blue-6' },
  purple: { label: 'Tím', fill: 'bg-purple-6' },
  pink: { label: 'Hồng', fill: 'bg-pink-6' },
  red: { label: 'Đỏ', fill: 'bg-red-6' },
  orange: { label: 'Cam', fill: 'bg-orange-6' },
  yellow: { label: 'Vàng', fill: 'bg-yellow-6' },
  graphite: { label: 'Than chì', fill: 'bg-neutral-6' },
} satisfies Record<AccentColor, { label: string; fill: string }>;

export const ACCENT_CHOICES: readonly ChoiceTileOption<AccentColor>[] = ACCENT_COLORS.map(
  (value) => ({ value, ...ACCENT_META[value] }),
);

export const accentLabelOf = (accent: AccentColor) => ACCENT_META[accent].label;

/** Phím tắt toàn cục — hiện ở Cài đặt để người dùng TỰ khám phá; nhãn theo máy (⌘ trên Apple, Ctrl nơi khác). */
export const SETTINGS_SHORTCUTS = [
  { keys: COMMAND_PALETTE_SHORTCUT_LABEL, label: 'Tìm kiếm trang, phân hệ, lệnh (hoặc phím /)' },
  { keys: formatShortcut('↑'), label: 'Lên một cấp (màn hình → trang chủ phân hệ)' },
  { keys: 'Enter', label: 'Trong bộ chọn phân hệ: mở kết quả đầu tiên' },
  { keys: formatShortcut('S'), label: 'Lưu phiếu đang nhập' },
] as const;
