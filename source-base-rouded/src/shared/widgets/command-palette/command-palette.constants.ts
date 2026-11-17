import { formatShortcut } from '@/shared/utils/browser/shortcut-label.utils';

/**
 * command-palette.constants.ts — phím tắt mở Command Palette: một nguồn cho cả listener lẫn nhãn hiển thị.
 */

/** `KeyboardEvent.code` của phím tắt (đi kèm Ctrl / ⌘ — `useCommandPaletteShortcut`). */
export const COMMAND_PALETTE_SHORTCUT_CODE = 'KeyK';

/** Nhãn phím tắt hiện trong tooltip / gợi ý — `⌘K` trên máy Apple, `Ctrl K` nơi khác. */
export const COMMAND_PALETTE_SHORTCUT_LABEL = formatShortcut('K');
