import { useKeyboardShortcut } from '@/shared/hooks';

import { COMMAND_PALETTE_SHORTCUT_CODE } from './command-palette.constants';

interface UseCommandPaletteShortcutOptions {
  /** `false` → không gắn listener. Mặc định `true`. */
  enabled?: boolean;
}

/**
 * useCommandPaletteShortcut — Ctrl/⌘+K BẬT / TẮT Command Palette từ bất kỳ đâu trong trang.
 *
 * Dùng:   useCommandPaletteShortcut(useCommandPaletteStore((s) => s.toggle));
 * Lưu ý:  nghe ở pha CAPTURE (bắt cả trong modal / bảng đã `stopPropagation`) và luôn `preventDefault()`
 *         — trình duyệt / extension dùng Ctrl+K cho ô tìm riêng. Gắn MỘT lần ở gốc layout.
 */
export function useCommandPaletteShortcut(
  onToggle: () => void,
  { enabled = true }: UseCommandPaletteShortcutOptions = {},
): void {
  useKeyboardShortcut({
    code: COMMAND_PALETTE_SHORTCUT_CODE,
    mods: ['mod'],
    capture: true,
    enabled,
    onTrigger: onToggle,
  });
}
