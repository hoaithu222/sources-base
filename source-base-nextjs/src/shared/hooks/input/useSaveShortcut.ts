'use client';

import { useKeyboardShortcut } from './useKeyboardShortcut';

interface UseSaveShortcutOptions {
  /** `false` → không bind gì cả (không có quyền sửa, panel đóng…). Mặc định `true`. */
  enabled?: boolean;
  /** `false` → vẫn nuốt phím nhưng KHÔNG gọi `onSave` (không có thay đổi / đang lưu). */
  canSave?: boolean;
}

/** `useSaveShortcut(onSave, { enabled, canSave })` — Ctrl/Cmd+S LƯU ngay, kể cả khi đang gõ trong ô nhập. */
export function useSaveShortcut(
  onSave: () => void,
  { enabled = true, canSave = true }: UseSaveShortcutOptions = {},
): void {
  useKeyboardShortcut({
    code: 'KeyS',
    mods: ['mod'],
    capture: true,
    enabled,
    onTrigger: () => {
      if (canSave) onSave();
    },
  });
}
