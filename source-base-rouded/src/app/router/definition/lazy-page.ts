import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * lazyPage — khai MỘT trang nạp lười; cách DUY NHẤT đưa trang vào route.
 *
 * Dùng:   page: lazyPage(() => import('@/features/user/pages/UserPage'))
 *         export có tên → lazyPage(() => import('…/UsersPage').then((m) => ({ default: m.UsersPage })))
 *         nạp trước khi người dùng mới có ý định mở (rê chuột / focus): `void page.preload()`
 * Lưu ý:  ⛔ mỗi lần gọi tạo MỘT component riêng — hai route phải giữ nguyên trang khi chuyển qua lại
 *         thì khai một hằng rồi dùng chung (docs/rules/structure/routing-conventions.md §7).
 */

export type PageLoader = () => Promise<{ default: ComponentType }>;

/** Trang nạp lười kèm `preload()`: tải mã trước, `React.lazy` dùng lại CÙNG lượt tải đó. */
export type LazyPage = LazyExoticComponent<ComponentType> & { preload: () => Promise<void> };

export function lazyPage(loader: PageLoader): LazyPage {
  let pending: ReturnType<PageLoader> | undefined;

  const load: PageLoader = () => {
    pending ??= loader().catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };

  const preload = () =>
    load().then(
      () => undefined,
      () => undefined,
    );

  return Object.assign(lazy(load), { preload });
}

/** `true` khi trang khai bằng `lazyPage()` (có `preload`); trang nạp sẵn (403, 404) thì `false`. */
export function isLazyPage(page: ComponentType): page is LazyPage {
  return typeof (page as Partial<LazyPage>).preload === 'function';
}
