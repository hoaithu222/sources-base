import type { AppIconName } from '@/shared/ui';

/**
 * command-palette.types.ts — dữ liệu vào của `<CommandPalette groups>`.
 */

interface CommandPaletteItemBase {
  id: string;
  label: string;
  description?: string;
  icon: AppIconName;
  /** Từ khoá phụ để tìm ra mục này (vd alias, mã phân hệ) — KHÔNG hiện ra UI. */
  keywords?: string[];
  /** Gọi khi mục được tô sáng (phím ↑ ↓, rê chuột, focus) — vd nạp trước mã trang đích. Tuỳ chọn. */
  onIntent?: () => void;
}

/** Mục ĐI TỚI TRANG — hàng là `<Link>` thật (chuột phải / Ctrl+click mở được tab mới). */
interface CommandPaletteLinkItem extends CommandPaletteItemBase {
  href: string;
  onSelect?: never;
}

/** Mục LỆNH TẠI CHỖ (đổi theme, mở modal…) — hàng là `<button>`. */
interface CommandPaletteActionItem extends CommandPaletteItemBase {
  href?: never;
  onSelect: () => void;
}

export type CommandPaletteItem = CommandPaletteLinkItem | CommandPaletteActionItem;

export interface CommandPaletteGroup {
  label: string;
  items: CommandPaletteItem[];
}
