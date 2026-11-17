'use client';

import { useEffect } from 'react';

import { useEventCallback } from '../state/useEventCallback';

/** Phím bổ trợ: `mod` = Ctrl (Windows / Linux) HOẶC ⌘ (macOS). */
export type ShortcutMod = 'mod' | 'alt' | 'shift';

export interface KeyboardShortcutOptions {
  /** `KeyboardEvent.code` — vị trí phím vật lý (`'KeyS'`, `'Escape'`), không đổi theo bộ gõ. */
  code: string;
  /** Phím bổ trợ PHẢI nhấn; phím không liệt kê thì PHẢI KHÔNG nhấn (khớp đúng tổ hợp). Mặc định `[]`. */
  mods?: readonly ShortcutMod[];
  /** Nghe ở pha CAPTURE — bắt cả khi modal / bảng đã `stopPropagation()`. Mặc định `false`. */
  capture?: boolean;
  /** Bỏ qua khi tiêu điểm đang ở ô nhập (`input` / `textarea` / `select` / `contenteditable`). Mặc định `false`. */
  ignoreWhileTyping?: boolean;
  /** Gọi `preventDefault()` trước `onTrigger`. Mặc định `true`. */
  preventDefault?: boolean;
  /** `false` → không gắn listener. Mặc định `true`. */
  enabled?: boolean;
  /** Chạy khi tổ hợp khớp; không cần ổn định tham chiếu. */
  onTrigger: (event: KeyboardEvent) => void;
}

const LETTER_CODE = /^Key([A-Z])$/;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
}

function matchesKey(event: KeyboardEvent, code: string): boolean {
  if (event.code === code || event.key === code) return true;
  const letter = LETTER_CODE.exec(code)?.[1];
  return letter !== undefined && (event.key === letter || event.key === letter.toLowerCase());
}

function matchesMods(event: KeyboardEvent, mods: readonly ShortcutMod[]): boolean {
  return (
    (event.ctrlKey || event.metaKey) === mods.includes('mod') &&
    event.altKey === mods.includes('alt') &&
    event.shiftKey === mods.includes('shift')
  );
}

/**
 * useKeyboardShortcut — gắn MỘT phím tắt toàn trang (listener `keydown` trên `window`) theo một luật chung:
 * khớp phím bằng `code` (hoặc `key` cùng tên — bàn phím / bộ gõ không phát `code`), khớp ĐÚNG tổ hợp phím bổ trợ.
 *
 * Phím tắt chuyên dụng dựng trên hook này: `useSaveShortcut` (Ctrl/⌘+S), `useTvEscapeHatch` (Ctrl/⌘+Alt+Shift+T).
 * Lưu ý: tổ hợp có Ctrl/⌘ thường nên `capture: true`; phím trơn (Esc, chữ cái) nên `ignoreWhileTyping: true`.
 *
 * @param options - Xem `KeyboardShortcutOptions`: `code`, `mods`, `capture`, `ignoreWhileTyping`, `preventDefault`,
 *   `enabled`, `onTrigger`.
 *
 * @example
 * useKeyboardShortcut({ code: 'KeyK', mods: ['mod'], capture: true, onTrigger: openPalette });
 * useKeyboardShortcut({ code: 'Escape', enabled: expanded, preventDefault: false, onTrigger: collapse });
 */
export function useKeyboardShortcut({
  code,
  mods = [],
  capture = false,
  ignoreWhileTyping = false,
  preventDefault = true,
  enabled = true,
  onTrigger,
}: KeyboardShortcutOptions): void {
  const trigger = useEventCallback(onTrigger);
  const modsKey = [...mods].sort().join('+');

  useEffect(() => {
    if (!enabled) return;
    const required = modsKey ? (modsKey.split('+') as ShortcutMod[]) : [];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!matchesKey(event, code) || !matchesMods(event, required)) return;
      if (ignoreWhileTyping && isTypingTarget(event.target)) return;
      if (preventDefault) event.preventDefault();
      trigger(event);
    };

    window.addEventListener('keydown', handleKeyDown, capture);
    return () => window.removeEventListener('keydown', handleKeyDown, capture);
  }, [enabled, code, modsKey, capture, ignoreWhileTyping, preventDefault, trigger]);
}
