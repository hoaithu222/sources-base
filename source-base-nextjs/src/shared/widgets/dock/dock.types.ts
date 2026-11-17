import type { AppIconName, AppTileTone, BoldSystemIconName } from '@/shared/ui';

/**
 * dock.types.ts — dữ liệu vào của `<Dock>` và thiết lập người dùng chọn cho nó.
 */

/** Một mục của `<Dock items>` — tầng `app/` dựng danh sách; widget KHÔNG đọc registry nào. */
export interface DockItemConfig {
  /** Khoá ổn định — dùng làm React key. */
  id: string;
  /** Tên hiển thị trong tooltip + `aria-label`. */
  label: string;
  icon: AppIconName;
  /** Tông ô icon (`AppTile`) — nhận diện phân hệ, cùng tông với bộ chọn phân hệ trên header. Mặc định `primary`. */
  tone?: AppTileTone;
  /** URL đích THẬT — Dock render `<Link>` để chuột phải mở được tab mới. */
  href: string;
  /** Gọi khi người dùng CÓ Ý ĐỊNH mở mục (rê chuột / focus) — vd nạp trước mã trang đích. Tuỳ chọn. */
  onIntent?: () => void;
}

/**
 * Chế độ hiển thị: `pinned` luôn hiện · `autohide` trượt khuất, rê chuột vào giữa mép neo thì trồi
 * ra · `collapsed` co thành tay nắm ba chấm · `hidden` khuất hẳn, không còn gợi ý.
 */
export type DockDisplayMode = 'pinned' | 'autohide' | 'collapsed' | 'hidden';

/** Cạnh màn hình neo Dock — như macOS: `bottom` (mặc định) · `left` · `right`. */
export type DockPosition = 'bottom' | 'left' | 'right';

export interface DockSettings {
  mode: DockDisplayMode;
  /** Phóng lân cận kiểu macOS khi rê chuột (`dock-magnify.css`). */
  magnify: boolean;
  position: DockPosition;
}

/** Một hàng chọn chế độ trên panel cấu hình Dock — nhãn / mô tả theo ngôn ngữ: `ui.widgets` → `dock.modes.<value>`. */
export interface DockModeOption {
  value: DockDisplayMode;
  icon: BoldSystemIconName;
}

/** Một ô chọn vị trí trên panel cấu hình Dock — nhãn theo ngôn ngữ: `ui.widgets` → `dock.positions.<value>`. */
export interface DockPositionOption {
  value: DockPosition;
}
