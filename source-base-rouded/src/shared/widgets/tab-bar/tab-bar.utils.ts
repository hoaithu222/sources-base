import { TAB_BAR_TILE_SPAN_CLASSES } from './tab-bar.theme';
import type { TabBarItem } from './tab-bar.types';

/**
 * tab-bar.utils.ts — hàm thuần chia mục lên thanh, nhận ra mục đang mở, chia bề rộng ô trong sheet.
 *
 * Dùng:   layoutTabBar(items) → { primary, overflow } · findActiveId(pathname, items)
 *         tileSpanClass(index, total) → class bề rộng ô thứ `index` của lưới sheet
 * Lưu ý:  tổng mục ≤ `TAB_BAR_MAX_CELLS` thì mọi mục nằm thẳng trên thanh, không có ô "Thêm".
 */

/** Số ô tối đa trên thanh (kể cả ô "Thêm") — 5 ô đều nhau như app di động. */
export const TAB_BAR_MAX_CELLS = 5;

interface TabBarLayout {
  primary: TabBarItem[];
  overflow: TabBarItem[];
}

type PortraitPerRow = keyof typeof TAB_BAR_TILE_SPAN_CLASSES.portrait;
type LandscapePerRow = keyof typeof TAB_BAR_TILE_SPAN_CLASSES.landscape;

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function layoutTabBar(
  items: readonly TabBarItem[],
  maxCells: number = TAB_BAR_MAX_CELLS,
): TabBarLayout {
  if (items.length <= maxCells) return { primary: [...items], overflow: [] };
  return { primary: items.slice(0, maxCells - 1), overflow: items.slice(maxCells - 1) };
}

/** `id` của mục đang mở — khớp theo href DÀI NHẤT (`/demo/ghep` thắng `/demo`); không mục nào khớp → `undefined`. */
export function findActiveId(pathname: string, items: readonly TabBarItem[]): string | undefined {
  return items
    .filter((item) => isActivePath(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.id;
}

function spanPerRow(index: number, total: number, perRow: 3 | 4): number {
  const remainder = total % perRow;
  return remainder > 0 && index >= total - remainder ? 12 / remainder : 12 / perRow;
}

export function tileSpanClass(index: number, total: number): string {
  const portrait = spanPerRow(index, total, 3) as PortraitPerRow;
  const landscape = spanPerRow(index, total, 4) as LandscapePerRow;
  const revert = portrait === 12 && landscape !== 12 ? TAB_BAR_TILE_SPAN_CLASSES.revert : undefined;
  return [
    TAB_BAR_TILE_SPAN_CLASSES.portrait[portrait],
    TAB_BAR_TILE_SPAN_CLASSES.landscape[landscape],
    revert,
  ]
    .filter(Boolean)
    .join(' ');
}
