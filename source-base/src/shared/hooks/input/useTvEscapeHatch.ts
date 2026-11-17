import { useKeyboardShortcut } from './useKeyboardShortcut';

/**
 * `useTvEscapeHatch(() => setDisplayMode('standard'))` — Ctrl/Cmd + Alt + Shift + T gọi callback để thoát chế độ TV.
 * ⛔ Nhận CALLBACK, không tự đọc `@/domains/preferences`: tầng `app/` nối vào store (xem `AppShellLayout.tsx`).
 * Bỏ qua phím khi đang gõ trong ô nhập; `onEscape` không cần ổn định tham chiếu.
 */
export function useTvEscapeHatch(onEscape: () => void): void {
  useKeyboardShortcut({
    code: 'KeyT',
    mods: ['mod', 'alt', 'shift'],
    ignoreWhileTyping: true,
    onTrigger: onEscape,
  });
}
