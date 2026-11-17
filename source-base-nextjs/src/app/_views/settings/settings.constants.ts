import { ACCENT_COLORS, type AccentColor } from '@/domains/preferences';
import { formatShortcut } from '@/shared/utils/browser/shortcut-label.utils';
import { COMMAND_PALETTE_SHORTCUT_LABEL } from '@/shared/widgets/command-palette';

/** Màu chấm của từng Màu nhấn (thứ tự theo `ACCENT_COLORS`, như dải Accent color của macOS); TÊN màu ở `account.settings.appearance.accents`. */
export const ACCENT_FILL = {
  vci: 'bg-linear-to-br from-green-6 via-teal-7 to-secondary-7',
  blue: 'bg-blue-6',
  purple: 'bg-purple-6',
  pink: 'bg-pink-6',
  red: 'bg-red-6',
  orange: 'bg-orange-6',
  yellow: 'bg-yellow-6',
  graphite: 'bg-neutral-6',
} satisfies Record<AccentColor, string>;

export const ACCENT_ORDER: readonly AccentColor[] = ACCENT_COLORS;

/** Phím tắt toàn cục — hiện ở Cài đặt để người dùng TỰ khám phá; nhãn phím theo máy (⌘ trên Apple, Ctrl nơi khác), CHỮ ở `account.settings.shortcuts`. */
export const SETTINGS_SHORTCUTS = [
  { id: 'search', keys: COMMAND_PALETTE_SHORTCUT_LABEL },
  { id: 'levelUp', keys: formatShortcut('↑') },
  { id: 'firstResult', keys: 'Enter' },
  { id: 'save', keys: formatShortcut('S') },
] as const;
