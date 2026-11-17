import { APP_NAME } from '@/shared/constants/app.constants';

import { readHandle, titledMatches, type RouteMatchLike } from '../definition';

/**
 * document-title.utils — tên màn đang mở dựng từ `meta` của các route đang khớp: `Phân hệ · Màn con`;
 * tên tab trình duyệt ghép thêm tên app: `Phân hệ · Màn con | Tên app`.
 *
 * Dùng:   resolveDocumentTitle(useMatches(), location.search)  (tab trình duyệt)
 *         resolveScreenTitle(useMatches(), location.search)    (câu báo chuyển trang — `RouteAnnouncer`)
 * Lưu ý:  tab nội bộ (`tabTitles`) lấy key theo thứ tự `:tab` → `?tab=` → `defaultTab` của CHÍNH trang
 *         đang đứng, và THAY cho tên màn con (không ghép thành ba tầng). Không route nào có tiêu đề
 *         → chỉ `APP_NAME` (giữ khớp `<title>` trong `index.html`).
 */

const TITLE_SEPARATOR = ' · ';
const APP_SEPARATOR = ' | ';

/** Khớp `tabKey` mặc định của `useQueryParams`. */
const TAB_PARAM = 'tab';

function tabTitleOf(match: RouteMatchLike): string {
  const { tabTitle, title } = readHandle(match);
  return tabTitle ?? title ?? '';
}

function resolveInnerTabTitle(
  titled: readonly RouteMatchLike[],
  search: string,
): string | undefined {
  const leaf = titled[titled.length - 1];
  const key =
    leaf.params[TAB_PARAM] ??
    new URLSearchParams(search).get(TAB_PARAM) ??
    readHandle(leaf).defaultTab;
  if (!key) return undefined;

  for (let i = titled.length - 1; i >= 0; i -= 1) {
    const title = readHandle(titled[i]).tabTitles?.[key];
    if (title) return title;
  }
  return undefined;
}

/** Tên màn đang mở (`Phân hệ · Màn con`, chưa ghép tên app); `undefined` khi không route nào có tiêu đề. */
export function resolveScreenTitle(
  matches: readonly RouteMatchLike[],
  search = '',
): string | undefined {
  const titled = titledMatches(matches);
  if (titled.length === 0) return undefined;

  const primary = tabTitleOf(titled[0]);
  const secondary = resolveInnerTabTitle(titled, search) ?? tabTitleOf(titled[titled.length - 1]);

  return secondary && secondary !== primary ? primary + TITLE_SEPARATOR + secondary : primary;
}

export function resolveDocumentTitle(matches: readonly RouteMatchLike[], search = ''): string {
  const screenTitle = resolveScreenTitle(matches, search);
  return screenTitle ? screenTitle + APP_SEPARATOR + APP_NAME : APP_NAME;
}
