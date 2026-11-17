import type { AppIconName } from '@/shared/ui';

import type { MenuItem, ModuleNavLink } from './navigation.types';

/**
 * screen-title.utils — tên MÀN ĐANG MỞ dựng từ cấu hình điều hướng (không còn `meta` của route): `Phân hệ · Màn con`.
 * Dùng cho thanh trên điện thoại và thẻ làm việc; tiêu đề `<title>` của tab trình duyệt do `generateMetadata` của từng trang lo.
 *
 * Dùng:   resolveScreenTitle(pathname, pages, modules)  → `{ title, fullTitle, icon? }` hoặc `undefined` khi URL không thuộc mục nào
 * Lưu ý:  khớp theo tiền tố PHÂN ĐOẠN và lấy mục SÂU NHẤT (`/demo/x` thuộc màn `/demo`). Mục bị ẩn khỏi menu / thiếu quyền
 *         không có tên → nơi gọi tự rơi về tên app.
 */

const TITLE_SEPARATOR = ' · ';

export interface ScreenTitle {
  /** Tên ngắn: màn con hoặc trang tĩnh. */
  title: string;
  /** `Phân hệ · Màn con` (hoặc `title` khi không khác tên phân hệ). */
  fullTitle: string;
  icon?: AppIconName;
}

const isUnder = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

const deepest = <T extends { href: string }>(
  items: readonly T[],
  pathname: string,
): T | undefined =>
  items
    .filter((item) => isUnder(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

function flatten(links: readonly ModuleNavLink[]): ModuleNavLink[] {
  return links.flatMap((link) => (link.children ? flatten(link.children) : [link]));
}

function moduleScreenTitle(
  pathname: string,
  modules: readonly MenuItem[],
): ScreenTitle | undefined {
  for (const navModule of modules) {
    const screen = deepest(flatten(navModule.nav ?? []), pathname);
    if (screen) {
      const fullTitle =
        screen.title === navModule.title
          ? navModule.title
          : navModule.title + TITLE_SEPARATOR + screen.title;
      return { title: screen.title, fullTitle, icon: navModule.icon };
    }
    if (isUnder(pathname, navModule.href)) {
      return { title: navModule.title, fullTitle: navModule.title, icon: navModule.icon };
    }
  }
  return undefined;
}

export function resolveScreenTitle(
  pathname: string,
  pages: readonly MenuItem[],
  modules: readonly MenuItem[],
): ScreenTitle | undefined {
  const fromModule = moduleScreenTitle(pathname, modules);
  if (fromModule) return fromModule;

  const page = deepest(pages, pathname);
  return page ? { title: page.title, fullTitle: page.title, icon: page.icon } : undefined;
}
