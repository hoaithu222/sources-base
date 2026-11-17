import type { BoldSystemIconName, SystemIconName } from '@/shared/ui';

/**
 * dock.types.ts — dữ liệu vào của `<Dock>` và thiết lập người dùng chọn cho nó.
 */

/** Một mục của `<Dock items>` — tầng `app/` dựng danh sách; widget KHÔNG đọc registry nào. */
export interface DockItemConfig {
  /** Khoá ổn định — dùng làm React key. */
  id: string;
  /** Tên hiển thị trong tooltip + `aria-label`. */
  label: string;
  icon: SystemIconName;
  /** URL đích THẬT — Dock render `<Link>` để chuột phải mở được tab mới. */
  href: string;
  /** Gọi khi người dùng CÓ Ý ĐỊNH mở mục (rê chuột / focus) — vd nạp trước mã trang đích. Tuỳ chọn. */
  onIntent?: () => void;
}

/**
 * Chế độ hiển thị: `pinned` luôn hiện · `autohide` trượt khuất, rê chuột vào giữa mép dưới thì trồi
 * lên · `collapsed` co thành tay nắm ba chấm · `hidden` khuất hẳn, không còn gợi ý.
 */
export type DockDisplayMode = 'pinned' | 'autohide' | 'collapsed' | 'hidden';

export interface DockSettings {
  mode: DockDisplayMode;
  /** Phóng lân cận kiểu macOS khi rê chuột (`dock-magnify.css`). */
  magnify: boolean;
}

/** Một hàng chọn chế độ trên panel cấu hình Dock. */
export interface DockModeOption {
  value: DockDisplayMode;
  icon: BoldSystemIconName;
  label: string;
  description: string;
}
