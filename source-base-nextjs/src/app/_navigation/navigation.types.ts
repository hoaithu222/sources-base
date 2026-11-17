import type { Messages } from '@/core/i18n';
import type { RoutePermission } from '@/domains/session';
import type { AppIconName, AppTileTone } from '@/shared/ui';

/**
 * navigation.types — hợp đồng kiểu của cấu hình điều hướng (`navigation.config.ts`) và của mục menu đã dựng.
 *
 * Dùng:   `NavPageDef` · `NavModuleDef` · `NavScreenDef` là dữ liệu KHAI BÁO (id, path, icon, quyền);
 *         `MenuItem` · `ModuleNavLink` là kết quả đã DỊCH + lọc quyền, đưa thẳng cho Dock / Header / bảng lệnh.
 * Lưu ý:  id của mọi mục là khoá trong `messages/<locale>/shell.json` → `nav.<id>.{title,subtitle,description}`;
 *         thiếu khoá thì TypeScript báo đỏ ở cả hai ngôn ngữ.
 */

/** Khoá của một mục điều hướng trong `shell.nav` — trang tĩnh, phân hệ và màn hình dùng chung một không gian id. */
export type NavId = keyof Messages['shell']['nav'];

/** Trang tĩnh ngoài phân hệ (bảng điều khiển, hồ sơ, cài đặt). */
export interface NavPageDef {
  id: NavId;
  /** Đường dẫn KHÔNG tiền tố ngôn ngữ — lấy từ `PATHS`. */
  path: string;
  /** Có `icon` và không `hideInMenu` thì hiện ở nhóm "Điều hướng chung" của bảng lệnh. */
  icon?: AppIconName;
  hideInMenu?: boolean;
  permission?: RoutePermission;
  /** Tăng dần; bỏ trống thì xếp cuối, giữ thứ tự khai báo. */
  order?: number;
}

/** Một màn hình của phân hệ — hiện trên dải điều hướng phân hệ ở header. */
export interface NavScreenDef {
  id: NavId;
  path: string;
  /** Icon thẻ màn hình ở trang chủ phân hệ. Bỏ trống → icon của phân hệ. */
  icon?: AppIconName;
  /** `true` → trang phụ / chi tiết, KHÔNG hiện trên dải điều hướng. */
  hideInNav?: boolean;
  permission?: RoutePermission;
}

/** Phân hệ nghiệp vụ — mục của Dock, bộ chọn phân hệ ở header, bảng lệnh. */
export interface NavModuleDef {
  id: NavId;
  /** Trang chủ của phân hệ. */
  path: string;
  icon: AppIconName;
  /** Tông ô icon (`AppTile`) — nhận diện phân hệ. Bỏ trống → `primary`. */
  tone?: AppTileTone;
  permission?: RoutePermission;
  order?: number;
  screens: readonly NavScreenDef[];
}

/** Chữ hiển thị đã dịch của một mục — `useAppMenu` dựng từ `messages.shell.nav`. */
export interface NavLabels {
  title: string;
  subtitle?: string;
  description?: string;
}

export type NavLabelResolver = (id: NavId) => NavLabels;

export interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: AppIconName;
  /** URL đích thật — để render `<Link>`. */
  href: string;
  /** Mọi quyền cần có để vào được `href` (xem `canAccess`). */
  permissions: readonly RoutePermission[];
  /** Tông ô icon của phân hệ (`AppTile`). */
  tone?: AppTileTone;
  /** Route con hiện trên thanh điều hướng phân hệ (chỉ phân hệ có). */
  nav?: ModuleNavLink[];
}

/** Một mục của thanh điều hướng phân hệ. */
export interface ModuleNavLink {
  id: string;
  title: string;
  href: string;
  permissions: readonly RoutePermission[];
  icon?: AppIconName;
  description?: string;
  children?: ModuleNavLink[];
}
