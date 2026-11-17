import type { RouteHandle } from './route.types';

/**
 * route-handle.utils — đọc metadata từ các route đang khớp (`useMatches()`); `handle` chính là `meta` đã khai.
 *
 * Dùng:   resolvePageTitle(useMatches()) · titledMatches(matches) · readHandle(match)
 */

/** Phần của `UIMatch` cần dùng — khai hẹp để test không phải dựng router. */
export interface RouteMatchLike {
  pathname: string;
  params: Readonly<Record<string, string | undefined>>;
  handle: unknown;
}

export function readHandle(match: Pick<RouteMatchLike, 'handle'>): RouteHandle {
  return (match.handle ?? {}) as RouteHandle;
}

/** Các route đang khớp CÓ khai tiêu đề, xếp từ ngoài vào trong. */
export function titledMatches<T extends RouteMatchLike>(matches: readonly T[]): T[] {
  return matches.filter((match) => Boolean(readHandle(match).title));
}

/** `meta.title` của trang đang đứng (route sâu nhất có tiêu đề); `undefined` khi không route nào có. */
export function resolvePageTitle(matches: readonly RouteMatchLike[]): string | undefined {
  return titledMatches(matches)
    .map((match) => readHandle(match).title)
    .at(-1);
}
