/** Phím bổ trợ của NHÃN phím tắt — cùng nghĩa `ShortcutMod` của `useKeyboardShortcut` (`mod` = Ctrl hoặc ⌘). */
export type ShortcutLabelMod = 'mod' | 'alt' | 'shift';

const APPLE_PLATFORM = /mac|iphone|ipad|ipod/i;

/** Thứ tự ký hiệu chuẩn của Apple: ⌥ ⇧ ⌘ rồi phím. */
const APPLE_ORDER: readonly ShortcutLabelMod[] = ['alt', 'shift', 'mod'];
const APPLE_GLYPH = { mod: '⌘', alt: '⌥', shift: '⇧' } satisfies Record<ShortcutLabelMod, string>;

const OTHER_ORDER: readonly ShortcutLabelMod[] = ['mod', 'alt', 'shift'];
const OTHER_NAME = { mod: 'Ctrl', alt: 'Alt', shift: 'Shift' } satisfies Record<
  ShortcutLabelMod,
  string
>;

/** Máy Apple (macOS · iPadOS · iOS) — nhãn phím dùng ký hiệu ⌘ ⌥ ⇧; ngoài trình duyệt → `false`. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const hinted = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  return APPLE_PLATFORM.test(hinted?.platform || navigator.platform || '');
}

/**
 * Nhãn phím tắt theo nền tảng, như menu của HĐH: Apple `⌘K` · `⌥⇧⌘T` (ký hiệu liền nhau) — nơi khác `Ctrl K` ·
 * `Ctrl Alt Shift T`. Chỉ là CHỮ hiển thị; bắt phím vẫn qua `useKeyboardShortcut` (`mod` = Ctrl hoặc ⌘).
 */
export function formatShortcut(
  key: string,
  mods: readonly ShortcutLabelMod[] = ['mod'],
  apple = isApplePlatform(),
): string {
  if (apple) {
    return `${APPLE_ORDER.filter((mod) => mods.includes(mod))
      .map((mod) => APPLE_GLYPH[mod])
      .join('')}${key}`;
  }
  return [
    ...OTHER_ORDER.filter((mod) => mods.includes(mod)).map((mod) => OTHER_NAME[mod]),
    key,
  ].join(' ');
}
