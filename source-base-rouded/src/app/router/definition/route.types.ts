import type { ComponentType } from 'react';

import type { RoutePermission } from '@/domains/session';
import type { AppIconName, AppTileTone } from '@/shared/ui';

/**
 * route.types — hợp đồng kiểu của khai báo route (luật và mẫu đầy đủ: docs/rules/structure/routing-conventions.md).
 *
 * Dùng:   key đứng theo thứ tự id → path / index → page / layout → permission → meta → children
 *         trang { path, page, meta } · trang index { index: true, page }
 *         · layout { path, layout?, children }
 * Lưu ý:  path cấp cao nhất TUYỆT ĐỐI (`/reports`), `children[].path` TƯƠNG ĐỐI (`:id`);
 *         quyền cộng dồn từ ngoài vào — của phân hệ là tối thiểu, của route con là thêm vào.
 */

/** Kết quả của `lazyPage()`, hoặc một component nạp sẵn. */
export type PageComponent = ComponentType;

/** Metadata hiển thị — đi nguyên vào `handle` của route. */
export interface RouteMeta {
  /** Tên ngắn: menu, vế đầu của tên tab trình duyệt, tiêu đề trang giữ chỗ. */
  title: string;
  /** Tên trên tab trình duyệt khi cần đầy đủ hơn `title`. */
  tabTitle?: string;
  /** Tên tab trình duyệt theo tab nội bộ; key là giá trị của `?tab=` / `:tab`. */
  tabTitles?: Readonly<Record<string, string>>;
  /** Key trong `tabTitles` dùng khi URL của CHÍNH route này chưa mang tab. */
  defaultTab?: string;
  /** Route con của phân hệ: `true` → KHÔNG hiện trên thanh điều hướng phân hệ ở header (trang chi tiết, trang phụ). */
  hideInNav?: boolean;
  /** Icon của MÀN HÌNH trên trang chủ phân hệ (thẻ màn hình). Bỏ trống → icon của phân hệ. */
  navIcon?: AppIconName;
  /** Một dòng mô tả màn hình trên thẻ ở trang chủ phân hệ. */
  navDescription?: string;
}

/** Metadata menu — chỉ có nghĩa ở entry cấp cao nhất (trang tĩnh, phân hệ). */
export interface MenuMeta {
  /** Có `icon` và không `hideInMenu` thì entry hiện trong menu. */
  icon?: AppIconName;
  subtitle?: string;
  /** Tăng dần; bỏ trống thì xếp cuối, giữ thứ tự khai báo. */
  order?: number;
  hideInMenu?: boolean;
  /** Tông ô icon (`AppTile`) — nhận diện phân hệ ở Dock, bộ chọn phân hệ, launcher. Bỏ trống → `primary`. */
  tone?: AppTileTone;
  /** Nhóm trong launcher phân hệ (vd "Tài chính", "Kho vận"). Bỏ trống → nhóm "Khác". */
  group?: string;
}

export interface PageRouteDef {
  /** Duy nhất toàn app — cần khi muốn tra path bằng `getRoutePath(id)`. */
  id?: string;
  path: string;
  page: PageComponent;
  permission?: RoutePermission;
  meta: RouteMeta;
  index?: never;
  layout?: never;
  children?: never;
}

export interface IndexRouteDef {
  id?: string;
  index: true;
  page: PageComponent;
  permission?: RoutePermission;
  /** Bỏ trống thì dùng metadata của route cha. */
  meta?: RouteMeta;
  path?: never;
  layout?: never;
  children?: never;
}

export interface LayoutRouteDef {
  id?: string;
  path: string;
  /** Phải render `<Outlet />`. Bỏ trống thì route chỉ là `<Outlet />` trần. */
  layout?: PageComponent;
  permission?: RoutePermission;
  meta?: RouteMeta;
  children: readonly RouteDef[];
  index?: never;
  page?: never;
}

export type RouteDef = PageRouteDef | IndexRouteDef | LayoutRouteDef;

/** Trang tĩnh cấp cao nhất — không thuộc phân hệ nào. */
export interface StaticPageDef extends PageRouteDef {
  id: string;
  path: `/${string}`;
  meta: RouteMeta & MenuMeta;
}

/** Một phân hệ: layout cấp cao nhất, có mặt ở Dock và bảng lệnh. */
export interface ModuleDef {
  /** kebab-case. Cũng là `resource` mặc định khi kiểm quyền. */
  id: string;
  path: `/${string}`;
  layout?: PageComponent;
  /** Bỏ trống = `{ resource: id, action: 'view' }`; `'authenticated'` = chỉ cần đăng nhập. */
  permission?: RoutePermission | 'authenticated';
  meta: RouteMeta &
    MenuMeta & {
      icon: AppIconName;
      /** Đích khi bấm ở menu, nếu khác `path`. Phải trỏ tới một route đã khai. */
      landingPath?: string;
    };
  children: readonly RouteDef[];
}

/** Thứ nằm trong `handle` của mỗi route đã dựng — đọc bằng `useMatches()`. */
export type RouteHandle = Partial<RouteMeta> & Partial<MenuMeta> & { id?: string };
