/**
 * Nhãn phím tắt theo nền tảng — Apple dùng ký hiệu liền nhau theo thứ tự ⌥ ⇧ ⌘, nơi khác dùng tên phím cách nhau.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatShortcut, isApplePlatform } from '@/shared/utils/browser/shortcut-label.utils';

describe('formatShortcut', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['K', ['mod'], true, '⌘K'],
    ['K', ['mod'], false, 'Ctrl K'],
    ['T', ['shift', 'mod', 'alt'], true, '⌥⇧⌘T'],
    ['T', ['shift', 'mod', 'alt'], false, 'Ctrl Alt Shift T'],
    ['↑', ['mod'], false, 'Ctrl ↑'],
    ['Enter', [], false, 'Enter'],
  ] as const)('%s + %j (apple=%s) → %s', (key, mods, apple, expected) => {
    expect(formatShortcut(key, mods, apple)).toBe(expected);
  });

  it('nhận máy Apple từ navigator.platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    expect(isApplePlatform()).toBe(true);
    expect(formatShortcut('S')).toBe('⌘S');
  });

  it('jsdom / Windows → Ctrl', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
    expect(isApplePlatform()).toBe(false);
    expect(formatShortcut('S')).toBe('Ctrl S');
  });
});
