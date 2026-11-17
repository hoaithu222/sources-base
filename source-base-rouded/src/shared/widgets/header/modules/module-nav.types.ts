import type { AppIconName, AppTileTone } from '@/shared/ui';

/**
 * module-nav.types.ts — dữ liệu PHÂN HỆ của header: danh sách cho bộ chọn (launcher) và dải điều hướng của phân hệ đang mở.
 * Tầng `app/shell/AppHeader.tsx` dựng từ module registry; widget KHÔNG đọc registry.
 */

/**
 * Cấp của header theo URL: `0` ngoài phân hệ · `1` trang chủ phân hệ (hiện dải màn hình) · `2` một màn hình của phân hệ ·
 * `3` sâu hơn (chi tiết bản ghi). Cấp ≥ 2 header ĐỔI CẤP: nút ‹ + tên phân hệ + màn hình đang mở.
 */
export type HeaderLevel = 0 | 1 | 2 | 3;

/** Một phân hệ trong launcher của `ModuleSwitcher`. */
export interface HeaderModule {
  id: string;
  title: string;
  subtitle?: string;
  icon: AppIconName;
  /** Tông `AppTile` — cùng tông với Dock. Mặc định `primary`. */
  tone?: AppTileTone;
  /** Nhóm trong launcher; bỏ trống → "Khác". */
  group?: string;
  /** URL THẬT của trang đích (render `<Link>`). */
  href: string;
  /** Có ý định mở (rê / focus) — vd nạp trước mã trang. */
  onIntent?: () => void;
  /** Màn hình của phân hệ (cùng dữ liệu dải màn hình) — bảng "Tất cả phân hệ" liệt kê để mở thẳng màn cần. */
  screens?: readonly HeaderNavItem[];
}

/** Một mục của dải điều hướng phân hệ: trang con, hoặc NHÓM (`children`) bung menu thả xuống. */
export interface HeaderNavItem {
  key: string;
  label: string;
  /** URL THẬT (`navigable-controls.md`). Nhóm: href của mục con đầu tiên. */
  href: string;
  /** Icon nhận diện của màn hình (`meta.navIcon` — ưu tiên icon VCI); bỏ trống → chỉ chữ. */
  icon?: AppIconName;
  /** Mục (hoặc một mục con) đang mở. */
  active?: boolean;
  onIntent?: () => void;
  children?: readonly HeaderNavItem[];
}
