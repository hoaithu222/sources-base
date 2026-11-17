import { formatShortcut, isApplePlatform } from '@/shared/utils/browser/shortcut-label.utils';
import { matchesSearch } from '@/shared/utils/format/string.utils';

import type { WorkTab, WorkTabStep } from './work-tabs.types';

/**
 * work-tabs.utils — luật của lịch sử thẻ: 3 thẻ gần nhất lên đầu (thanh dọc + nhóm "Gần đây" của bảng), phần còn lại chia nhóm
 * "Đã ghim" / "Trước đó", lọc bỏ dấu, nhãn phím chuyển thẻ.
 *
 * Dùng:   splitHistory(tabs, pathname) → { recent, pinned, earlier } · filterHistory(tabs, query) · byRecency(tabs)
 *         workTabStepLabel('next') → "Ctrl Shift ]" (Apple "⌃⇧]")
 * Lưu ý:  mỗi thẻ nằm ĐÚNG MỘT nhóm; thẻ của màn đang mở luôn trong `recent` (kể cả khung hình trước khi `visit` chạy).
 */

/** Số thẻ mở GẦN NHẤT hiện trên thanh dọc (và nhóm "Gần đây" của bảng); còn lại sau nút "+N". */
export const WORK_TABS_RECENT_VISIBLE = 3;

/** Bảng có ô lọc khi số thẻ vượt mốc này. */
export const WORK_TABS_FILTER_FROM = 6;

/** `KeyboardEvent.code` của phím chuyển thẻ trước / sau (đi cùng Ctrl/⌘ + Shift). */
export const WORK_TAB_STEP_CODE = { prev: 'BracketLeft', next: 'BracketRight' } satisfies Record<
  WorkTabStep,
  string
>;

const WORK_TAB_STEP_KEY = { prev: '[', next: ']' } satisfies Record<WorkTabStep, string>;

/** Mới mở nhất trước (`visitedAt` tăng ngặt; trùng mốc thì thẻ mở sau thắng). */
export function byRecency(tabs: readonly WorkTab[]): WorkTab[] {
  return tabs
    .map((tab, index) => ({ tab, index }))
    .sort((a, b) => b.tab.visitedAt - a.tab.visitedAt || b.index - a.index)
    .map(({ tab }) => tab);
}

/**
 * Chia lịch sử: `recent` = `recentCount` thẻ mở gần nhất (luôn gồm thẻ đang mở) · `pinned` = thẻ ghim còn lại (thứ tự
 * store) · `earlier` = thẻ còn lại, mới nhất trước.
 */
export function splitHistory(
  tabs: readonly WorkTab[],
  activePath: string,
  recentCount = WORK_TABS_RECENT_VISIBLE,
) {
  const ordered = byRecency(tabs);
  const active = ordered.find((tab) => tab.path === activePath);
  let recent = ordered.slice(0, recentCount);
  if (active && !recent.includes(active)) recent = [active, ...recent.slice(0, recentCount - 1)];
  const rest = (tab: WorkTab) => !recent.includes(tab);
  return {
    recent,
    pinned: tabs.filter((tab) => tab.pinned && rest(tab)),
    earlier: ordered.filter((tab) => !tab.pinned && rest(tab)),
  };
}

/** Thẻ khớp ô lọc (bỏ dấu, theo tên + `fullTitle`), mới nhất trước. */
export function filterHistory(tabs: readonly WorkTab[], query: string): WorkTab[] {
  return byRecency(tabs.filter((tab) => matchesSearch([tab.title, tab.fullTitle], query)));
}

/**
 * Nhãn phím chuyển thẻ: `Ctrl Shift ]` · máy Apple `⌃⇧]` — ⇧⌘[ / ⇧⌘] là phím đổi tab của chính trình duyệt (trang
 * không nhận được), còn phím Control vẫn khớp `mod` của `useKeyboardShortcut`.
 */
export function workTabStepLabel(step: WorkTabStep, apple = isApplePlatform()): string {
  const key = WORK_TAB_STEP_KEY[step];
  return apple
    ? `⌃${formatShortcut(key, ['shift'], true)}`
    : formatShortcut(key, ['mod', 'shift'], false);
}
